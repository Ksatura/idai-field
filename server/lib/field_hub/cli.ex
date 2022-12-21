defmodule FieldHub.CLI do

  alias FieldHub.{
    CouchService,
    FileStore,
    Issues,
    Statistics
  }

  require Logger

  def setup_couchdb_single_node() do
    HTTPoison.start()

    Logger.info("Running initial CouchDB setup for single node at #{CouchService.url()}...")
    # See https://docs.couchdb.org/en/3.2.0/setup/single-node.html

    {users, replicator } = CouchService.initial_setup(CouchService.get_admin_credentials())

    case users do
      %{status_code: 412} ->
        Logger.warning("System database '_users' already exists. You probably ran the CouchDB setup on an existing instance.")
      %{status_code: code} when 199 < code and code < 300 ->
        Logger.info("Created system database `_users`.")
    end

    case replicator do
      %{status_code: 412} ->
        Logger.warning("System database '_replicator' already exists. You probably ran the CouchDB setup on an existing instance.")
      %{status_code: code} when 199 < code and code < 300 ->
        Logger.info("Created system database `_replicator`.")
    end
    Logger.info("Single node setup done.")
  end

  def create_project(project_name) do
    HTTPoison.start()

    CouchService.create_project(project_name, CouchService.get_admin_credentials())
    |> case do
      %{status_code: 412} ->
        Logger.warning("Project database '#{project_name}' already exists.")
      %{status_code: code} when 199 < code and code < 300 ->
        Logger.info("Created project database '#{project_name}'.")
    end

    FileStore.create_directories(project_name)
    |> Enum.each(fn(result) ->
      case result do
        {:ok, file_variant} ->
          Logger.info("Created directory for #{file_variant}.")
        {{:error, reason}, file_variant } ->
          Logger.error("Got posix error #{reason} while trying to create directory for #{file_variant}.")
      end
    end)
  end

  def delete_project(project_name) do
    HTTPoison.start()

    CouchService.delete_project(project_name, CouchService.get_admin_credentials())
    |> case do
      %{status_code: 404} ->
        Logger.warning("Project database '#{project_name}' does not exists.")
      %{status_code: code} when 199 < code and code < 300 ->
        Logger.info("Deleted project database '#{project_name}'.")
    end

    # Deactivated for now, we do not really delete images for existing projects (we are just adding tombstone files)
    # so we probably should also keep the files directory when deleting project (?).
    # FileStore.remove_directories(project_name)
    # |> case do
    #   {:ok, deleted} ->
    #     Logger.info("Deleted #{Enum.count(deleted)} files for '#{project_name}'.")
    #     deleted
    #     |> Enum.each(&Logger.info(&1))

    #   {:error, reason, file} ->
    #     Logger.error("Got posix error #{reason} while trying to delete #{file}.")
    # end
  end


  def create_project_with_default_user(project_name, password) do
    HTTPoison.start()

    create_project(project_name)
    create_user(project_name, password)
    add_user_as_project_member(project_name, project_name)
  end

  def create_project_with_default_user(project_name) do
    HTTPoison.start()

    create_project_with_default_user(project_name, create_password(32))
  end

  def create_user(name, password) do
    HTTPoison.start()

    %{status_code: status_code} = CouchService.create_user(name, password, CouchService.get_admin_credentials())
    case status_code do
      201 ->
        Logger.info("Created user '#{name}' with password '#{password}'.")
      404 ->
        Logger.error("CouchDB setup seems to be incomplete, unable to add user.")
      409 ->
        Logger.warning("User '#{name}' already exists.")
    end
  end

  def create_user(user_name) do
    HTTPoison.start()

    create_user(user_name, create_password(32))
  end

  def delete_user(user_name) do
    HTTPoison.start()

    CouchService.delete_user(user_name, CouchService.get_admin_credentials())
    |> case do
      %{status_code: 200} ->
        Logger.info("Deleted user #{user_name}.")
      val ->
        Logger.warning(val)
    end
  end

  def set_password(user_name, user_password) do
    HTTPoison.start()

    CouchService.set_password(user_name, user_password, CouchService.get_admin_credentials())
  end

  def add_user_as_project_admin(user_name, project) do
    HTTPoison.start()

    Logger.info("Adding '#{user_name}' as admin for project '#{project}'.")
    CouchService.add_project_admin(user_name, project, CouchService.get_admin_credentials())
  end

  def add_user_as_project_member(user_name, project) do
    HTTPoison.start()

    Logger.info("Adding '#{user_name}' as member for project '#{project}'.")
    CouchService.add_project_member(user_name, project, CouchService.get_admin_credentials())
  end

  def remove_user_from_project(user_name, project) do
    HTTPoison.start()

    Logger.info("Removing '#{user_name}' from project '#{project}'.")
    CouchService.remove_user_from_project(user_name, project, CouchService.get_admin_credentials())
  end

  def get_project_statistics() do
    CouchService.get_admin_credentials()
    |> Statistics.get_all()
    |> Enum.each(&print_statistics/1)
  end

  def get_project_statistics(project_name) do
    CouchService.get_admin_credentials()
    |> Statistics.get_for_project(project_name)
    |> print_statistics()
  end

  def get_project_issues(project_name) do
    CouchService.get_admin_credentials()
    |> Issues.evaluate_all(project_name)
    |> print_issues()
  end

  defp print_statistics(%{name: project_name, database: db, files: files}) do
    header = "######### Project '#{project_name}' #########"

    Logger.info(header)
    Logger.info("Database documents: #{db[:doc_count]}")
    Logger.info("Database size: #{Sizeable.filesize(db[:file_size])} (#{db[:file_size]} bytes)")

    case files do
      :enoent ->
        Logger.warning("No files directory found for '#{project_name}'.")
      values ->
        values
        |> Enum.each(fn ({file_type, file_info}) ->
          Logger.info("#{get_file_type_label(file_type)} files: #{file_info[:active]}, size: #{Sizeable.filesize(file_info[:active_size])} (#{file_info[:active_size]} bytes)")
        end)
    end
    Logger.info("#{String.duplicate("#", String.length(header))}\n")
  end

  defp print_issues([]) do
    Logger.info("No issues found.")
  end

  defp print_issues(issues) do
    issues
    |> Enum.each(fn(%Issues.Issue{type: type, severity: severity, data: data}) ->
      case severity do
        :info ->
          print_issue(type, data, &Logger.info/1)
        :warning ->
          print_issue(type, data, &Logger.warning/1)
        _ ->
          print_issue(type, data, &Logger.error/1)
      end
    end)
  end

  defp print_issue(type, data, logger_function) do

    case Map.values(data) do
      [] ->
        logger_function.("Issue: #{type}.")
      _vals ->
        logger_function.("Issue: #{type}:")
    end

    data
    |> Enum.each(fn{key, value} ->
      logger_function.("- #{key}: #{value}")
    end)
  end

  defp get_file_type_label(type) do
    case type do
      :original_image ->
        "Original image"
      :thumbnail_image ->
        "Thumbnail image"
    end
  end

  defp create_password(length) do
      length
      |> :crypto.strong_rand_bytes()
      |> Base.encode64()
      |> binary_part(0, length)
  end
end
