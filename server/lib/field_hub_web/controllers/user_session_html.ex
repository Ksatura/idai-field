defmodule FieldHubWeb.UserSessionHtml do
  use FieldHubWeb, :html

  def new(assigns) do
    ~H"""
    <h1>Log in</h1>

    """
  end
end

# <.form let={f} for={@conn} action={Routes.user_session_path(@conn, :create)} as={:user}>
# <%= if @error_message do %>
# <div class="alert alert-danger">
#   <p><%= @error_message %></p>
# </div>
# <% end %>

# <%= label f, :name %>
# <%= text_input f, :name, required: true %>

# <%= label f, :password %>
# <%= password_input f, :password, required: true %>

# <div>
# <%= submit "Log in" %>
# </div>
# </.form>
