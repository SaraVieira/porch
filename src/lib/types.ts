import type { WebAuthnCredential } from '@simplewebauthn/server'

export interface LoggedInUser {
  id: string
  username: string
  credentials: Array<WebAuthnCredential>
}

export interface Stream {
  id: string // Unique identifier for the stream
  streamNo: number // Stream number/index
  language: string // Stream language (e.g., "English", "Spanish")
  hd: boolean // Whether the stream is in HD quality
  embedUrl: string // URL that can be used to embed the stream
  source: string // Source identifier (e.g., "alpha", "bravo")
}

export interface APIMatch {
  id: string // Unique identifier for the match
  title: string // Match title (e.g. "Team A vs Team B")
  category: string // Sport category (e.g. "football", "basketball")
  date: number // Unix timestamp in milliseconds
  poster?: string // URL path to match poster image
  popular: boolean // Whether the match is marked as popular
  teams?: {
    home?: {
      name: string // Home team name
      badge: string // URL path to home team badge
    }
    away?: {
      name: string // Away team name
      badge: string // URL path to away team badge
    }
  }
  sources: Array<{
    source: string // Stream source identifier (e.g. "alpha", "bravo")
    id: string // Source-specific match ID
  }>
}

export interface Memo {
  id: number
  title: string
  content: string
  mood: string
  date: string
  createdAt: Date | null
  updatedAt: Date | null
}

export type MoodType =
  | 'happy'
  | 'sad'
  | 'neutral'
  | 'excited'
  | 'anxious'
  | 'calm'
  | 'energetic'
  | 'tired'
  | 'grateful'

export interface CoolifyAPI {
  services: Array<Service>
  applications: Array<Application>
}

export interface Service {
  uuid: string
  name: string
  environment_id: number
  created_at: string
  updated_at: string
  server_id: number
  description: string
  docker_compose_raw: string
  docker_compose: string
  destination_type: string
  destination_id: number
  deleted_at: any
  connect_to_docker_network: boolean
  config_hash: string
  service_type: string
  is_container_label_escape_enabled: boolean
  compose_parsing_version: string
  laravel_through_key: number
  server_status: boolean
  status: string
  server: Server
  applications: Array<{
    id: number
    uuid: string
    name: string
    human_name: any
    description: any
    fqdn?: string
    ports: string
    exposes: any
    status: string
    service_id: number
    created_at: string
    updated_at: string
    exclude_from_status: boolean
    required_fqdn: boolean
    image: string
    is_log_drain_enabled: boolean
    is_include_timestamps: boolean
    deleted_at: any
    is_gzip_enabled: boolean
    is_stripprefix_enabled: boolean
    last_online_at: string
    is_migrated: boolean
  }>
  databases: Array<Database>
}

export interface Server {
  id: number
  uuid: string
  name: string
  description: string
  ip: string
  port: number
  user: string
  team_id: number
  private_key_id: number
  proxy: Proxy
  created_at: string
  updated_at: string
  unreachable_notification_sent: boolean
  unreachable_count: number
  high_disk_usage_notification_sent: boolean
  log_drain_notification_sent: boolean
  swarm_cluster: any
  validation_logs: any
  sentinel_updated_at: string
  deleted_at: any
  ip_previous: any
  hetzner_server_id: any
  cloud_provider_token_id: any
  hetzner_server_status: any
  is_validating: boolean
  is_coolify_host: boolean
  settings: Settings
}

export interface Proxy {
  type: string
  status: string
  redirect_enabled: boolean
  force_stop: boolean
}

export interface Settings {
  id: number
  is_swarm_manager: boolean
  is_jump_server: boolean
  is_build_server: boolean
  is_reachable: boolean
  is_usable: boolean
  server_id: number
  created_at: string
  updated_at: string
  wildcard_domain: any
  is_cloudflare_tunnel: boolean
  is_logdrain_newrelic_enabled: boolean
  logdrain_newrelic_license_key: any
  logdrain_newrelic_base_uri: any
  is_logdrain_highlight_enabled: boolean
  logdrain_highlight_project_id: any
  is_logdrain_axiom_enabled: boolean
  logdrain_axiom_dataset_name: any
  logdrain_axiom_api_key: any
  is_swarm_worker: boolean
  is_logdrain_custom_enabled: boolean
  logdrain_custom_config: any
  logdrain_custom_config_parser: any
  concurrent_builds: number
  dynamic_timeout: number
  force_disabled: boolean
  is_metrics_enabled: boolean
  generate_exact_labels: boolean
  force_docker_cleanup: boolean
  docker_cleanup_frequency: string
  docker_cleanup_threshold: number
  server_timezone: string
  delete_unused_volumes: boolean
  delete_unused_networks: boolean
  is_sentinel_enabled: boolean
  sentinel_token: string
  sentinel_metrics_refresh_rate_seconds: number
  sentinel_metrics_history_days: number
  sentinel_push_interval_seconds: number
  sentinel_custom_url: string
  server_disk_usage_notification_threshold: number
  is_sentinel_debug_enabled: boolean
  server_disk_usage_check_frequency: string
  is_terminal_enabled: boolean
}

export interface Database {
  id: number
  uuid: string
  name: string
  human_name: any
  description: any
  ports: string
  exposes: any
  status: string
  service_id: number
  created_at: string
  updated_at: string
  exclude_from_status: boolean
  image: string
  public_port: any
  is_public: boolean
  is_log_drain_enabled: boolean
  is_include_timestamps: boolean
  deleted_at: any
  is_gzip_enabled: boolean
  is_stripprefix_enabled: boolean
  last_online_at: string
  is_migrated: boolean
  custom_type: any
}

export interface Application {
  uuid: string
  name: string
  additional_networks_count: number
  additional_servers: Array<any>
  additional_servers_count: number
  base_directory: string
  build_command?: string
  build_pack: string
  compose_parsing_version: string
  config_hash: string
  custom_docker_run_options: any
  custom_healthcheck_found: boolean
  custom_labels: string
  custom_network_aliases: any
  custom_nginx_configuration: string
  deleted_at: any
  description: string
  destination: Destination
  destination_id: number
  destination_type: string
  docker_compose?: string
  docker_compose_custom_build_command: any
  docker_compose_custom_start_command: any
  docker_compose_domains?: string
  docker_compose_location: string
  docker_compose_raw?: string
  docker_registry_image_name: any
  docker_registry_image_tag: any
  dockerfile: any
  dockerfile_location: string
  dockerfile_target_build: any
  environment_id: number
  fqdn?: string
  git_branch: string
  git_commit_sha: string
  git_full_url: any
  git_repository: string
  health_check_enabled: boolean
  health_check_host: string
  health_check_interval: number
  health_check_method: string
  health_check_path: string
  health_check_port: any
  health_check_response_text: any
  health_check_retries: number
  health_check_return_code: number
  health_check_scheme: string
  health_check_start_period: number
  health_check_timeout: number
  http_basic_auth_password: any
  http_basic_auth_username: any
  install_command?: string
  is_http_basic_auth_enabled: boolean
  laravel_through_key: number
  last_online_at: string
  limits_cpu_shares: number
  limits_cpus: string
  limits_cpuset: any
  limits_memory: string
  limits_memory_reservation: string
  limits_memory_swap: string
  limits_memory_swappiness: number
  manual_webhook_secret_bitbucket: any
  manual_webhook_secret_gitea: any
  manual_webhook_secret_github: any
  manual_webhook_secret_gitlab: any
  ports_exposes: string
  ports_mappings: any
  post_deployment_command: any
  post_deployment_command_container: any
  pre_deployment_command: any
  pre_deployment_command_container: any
  preview_url_template: string
  private_key_id: any
  publish_directory: string
  redirect: string
  repository_project_id?: number
  server_status: boolean
  source_id: number
  source_type: string
  start_command?: string
  static_image: string
  status: string
  swarm_placement_constraints: any
  swarm_replicas: number
  watch_paths: any
  created_at: string
  updated_at: string
}

export interface Destination {
  id: number
  name: string
  uuid: string
  network: string
  server_id: number
  created_at: string
  updated_at: string
  server: Server2
}

export interface Server2 {
  id: number
  uuid: string
  name: string
  description: string
  ip: string
  port: number
  user: string
  team_id: number
  private_key_id: number
  proxy: Proxy2
  created_at: string
  updated_at: string
  unreachable_notification_sent: boolean
  unreachable_count: number
  high_disk_usage_notification_sent: boolean
  log_drain_notification_sent: boolean
  swarm_cluster: any
  validation_logs: any
  sentinel_updated_at: string
  deleted_at: any
  ip_previous: any
  hetzner_server_id: any
  cloud_provider_token_id: any
  hetzner_server_status: any
  is_validating: boolean
  is_coolify_host: boolean
  settings: Settings2
}

export interface Proxy2 {
  type: string
  status: string
  redirect_enabled: boolean
  force_stop: boolean
}

export interface Settings2 {
  id: number
  is_swarm_manager: boolean
  is_jump_server: boolean
  is_build_server: boolean
  is_reachable: boolean
  is_usable: boolean
  server_id: number
  created_at: string
  updated_at: string
  wildcard_domain: any
  is_cloudflare_tunnel: boolean
  is_logdrain_newrelic_enabled: boolean
  logdrain_newrelic_license_key: any
  logdrain_newrelic_base_uri: any
  is_logdrain_highlight_enabled: boolean
  logdrain_highlight_project_id: any
  is_logdrain_axiom_enabled: boolean
  logdrain_axiom_dataset_name: any
  logdrain_axiom_api_key: any
  is_swarm_worker: boolean
  is_logdrain_custom_enabled: boolean
  logdrain_custom_config: any
  logdrain_custom_config_parser: any
  concurrent_builds: number
  dynamic_timeout: number
  force_disabled: boolean
  is_metrics_enabled: boolean
  generate_exact_labels: boolean
  force_docker_cleanup: boolean
  docker_cleanup_frequency: string
  docker_cleanup_threshold: number
  server_timezone: string
  delete_unused_volumes: boolean
  delete_unused_networks: boolean
  is_sentinel_enabled: boolean
  sentinel_token: string
  sentinel_metrics_refresh_rate_seconds: number
  sentinel_metrics_history_days: number
  sentinel_push_interval_seconds: number
  sentinel_custom_url: string
  server_disk_usage_notification_threshold: number
  is_sentinel_debug_enabled: boolean
  server_disk_usage_check_frequency: string
  is_terminal_enabled: boolean
}

export interface WeatherColumn {
  temperature: number
  scale: number
  hasPrecipitation: boolean
  isCurrentColumn: boolean
}

export interface WeatherData {
  current: {
    temperature_2m: number
    apparent_temperature: number
    weather_code: number
  }
  hourly: {
    time: Array<string>
    temperature_2m: Array<number>
    precipitation_probability: Array<number>
    weather_code: Array<number>
  }
}
