defmodule FieldHubWeb.Api.FileController do
  use FieldHubWeb, :controller

  alias FieldHub.FileStore
  alias FieldHubWeb.ErrorView

  def index(conn, %{"project" => project, "type" => type}) do
    parsed_type = parse_type(type)

    file_store_data =
      case parsed_type do
        {:error, msg} ->
          conn
          |> render(ErrorView, "400.json", message: msg)
        valid ->
          FileStore.get_file_list(%{project: Zarex.sanitize(project), type: parsed_type})
      end

    case file_store_data do
      {:error, :enoent} ->
        conn
        |> render(ErrorView, "404.json")
      {:ok, file_names} ->
        render(conn, "list.json", %{file_names: file_names})
    end
  end

  # Default to type original_image if none provided.
  def index(conn, %{"project" => project}) do
    index(conn, %{"project" => project, "type" => "original_image"})
  end

  def show(conn, %{"project" => project, "id" => uuid, "type" => type}) do
    parsed_type =
      parse_type(type)

    file_store_data =
      case parsed_type do
        {:error, msg} ->
          conn
          |> render(ErrorView, "400.json", message: msg)
        valid ->
          FileStore.get_file_path(%{uuid: Zarex.sanitize(uuid) , project: Zarex.sanitize(project), type: parsed_type})
      end

    case file_store_data do
      {:error, :enoent} ->
        conn
        |> render(ErrorView, "404.json")
      {:ok, file_path} ->
        Plug.Conn.send_file(conn, 200, file_path)
    end
  end

  # Default to type original_image if none provided.
  def show(conn, %{"project" => project, "id" => uuid}) do
    show(conn, %{"project" => project, "id" => uuid, "type" => "original_image"})
  end

  defp parse_type(type) do
    case type do
      "thumbnail_image" ->
        :thumbnail_image
      "original_image" ->
        :original_image
      _ ->
        {:error, "Unknown file type: '#{type}'."}
    end
  end
end
