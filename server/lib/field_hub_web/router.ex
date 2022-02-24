defmodule FieldHubWeb.Router do

  use FieldHubWeb, :router

  import FieldHubWeb.Plugs

  pipeline :browser do
    plug Plug.Parsers,
      parsers: [:urlencoded, :multipart, :json],
      pass: ["*/*"],
      json_decoder: Phoenix.json_library()

    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_live_flash
    plug :put_root_layout, {FieldHubWeb.LayoutView, :root}
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  pipeline :api do
    plug Plug.Parsers,
      parsers: [:urlencoded, :multipart, :json],
      pass: ["*/*"],
      json_decoder: Phoenix.json_library()

    plug :accepts, ["json"]
    plug :api_auth
  end

  forward "/db", ReverseProxyPlug, upstream: Application.get_env(:field_hub, :couchdb_url)

  scope "/", FieldHubWeb do
    pipe_through :browser

    get "/", PageController, :index
  end

  scope "/files/:project", FieldHubWeb do
    pipe_through :api

    resources("/", Api.FileController, only: [:index, :update, :show, :delete])
  end

  # Other scopes may use custom stacks.
  # scope "/api", FieldHubWeb do
  #   pipe_through :api
  # end

  # Enables LiveDashboard only for development
  #
  # If you want to use the LiveDashboard in production, you should put
  # it behind authentication and allow only admins to access it.
  # If your application does not have an admins-only section yet,
  # you can use Plug.BasicAuth to set up some basic authentication
  # as long as you are also using SSL (which you should anyway).
  if Mix.env() in [:dev, :test] do
    import Phoenix.LiveDashboard.Router

    scope "/" do
      pipe_through :browser

      live_dashboard "/dashboard", metrics: FieldHubWeb.Telemetry
    end
  end

  # Enables the Swoosh mailbox preview in development.
  #
  # Note that preview only shows emails that were sent by the same
  # node running the Phoenix server.
  if Mix.env() == :dev do
    scope "/dev" do
      pipe_through :browser

      forward "/mailbox", Plug.Swoosh.MailboxPreview
    end
  end
end
