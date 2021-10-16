defmodule IdaiFieldServerWeb.UserSettingsController do
  use IdaiFieldServerWeb, :controller

  alias IdaiFieldServer.CouchdbDatastore
  alias IdaiFieldServer.Accounts
  alias IdaiFieldServerWeb.UserAuth

  plug :assign_email_and_password_changesets

  def edit(conn, _params) do
    render(conn, "edit.html")
  end

  def update_email(conn, %{"current_password" => password, "user" => user_params}) do
    user = conn.assigns.current_user

    case Accounts.apply_user_email(user, password, user_params) do
      {:ok, applied_user} ->
        Accounts.deliver_update_email_instructions(
          applied_user,
          user.email,
          &Routes.user_settings_url(conn, :confirm_email, &1)
        )

        conn
        |> put_flash(
          :info,
          "A link to confirm your e-mail change has been sent to the new address."
        )
        |> redirect(to: Routes.user_settings_path(conn, :edit))

      {:error, changeset} ->
        render(conn, "edit.html", email_changeset: changeset)
    end
  end

  def confirm_email(conn, %{"token" => token}) do
    case Accounts.update_user_email(conn.assigns.current_user, token) do
      :ok ->
        conn
        |> put_flash(:info, "E-mail changed successfully.")
        |> redirect(to: Routes.user_settings_path(conn, :edit))

      :error ->
        conn
        |> put_flash(:error, "Email change link is invalid or it has expired.")
        |> redirect(to: Routes.user_settings_path(conn, :edit))
    end
  end

  def update_password(conn, %{ "password_changeset" => %{
        "password" => new_password,
        "password_confirmation" => new_password_confirmation,
        "current_password" => current_password
      }}) do
    user = conn.assigns.current_user

    if new_password != new_password_confirmation do
      conn = conn |> put_flash(:error, "password and password confirmation do not match")
      render(conn, "edit.html")
    else
      if user = CouchdbDatastore.authorize(user.name, current_password) do

        CouchdbDatastore.change_password user.name, new_password

        conn
        |> put_flash(:info, "Password updated successfully.")
        |> put_session(:user_return_to, Routes.user_settings_path(conn, :edit))
        |> UserAuth.log_in_user(user)
      else
        conn = conn |> put_flash(:error, "current password not correct")
        render(conn, "edit.html")
      end
    end

    # {:error, changeset} ->
      # render(conn, "edit.html", password_changeset: changeset)
  end

  defp assign_email_and_password_changesets(conn, _opts) do
    user = conn.assigns.current_user

    conn
    # |> assign(:email_changeset, Accounts.change_user_email(user))
    # |> assign(:password_changeset, Accounts.change_user_password(user))
  end
end
