use budlum_explorer_api::app;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env().unwrap_or_else(|_| {
                tracing_subscriber::EnvFilter::new("info,budlum_explorer_api=debug")
            }),
        )
        .init();

    let app = app();

    let port: u16 = std::env::var("PORT")
        .ok()
        .and_then(|p| p.parse().ok())
        .unwrap_or(8080);
    let addr = format!("0.0.0.0:{port}");
    let listener = tokio::net::TcpListener::bind(&addr).await?;
    tracing::info!("budlum-explorer-api listening on {addr} (dataSource: seeded)");
    tracing::info!("endpoints under /api/* — health: http://{addr}/api/health");

    axum::serve(listener, app).await?;
    Ok(())
}
