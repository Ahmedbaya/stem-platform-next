export const PERMISSIONS = {
  admin: [
    "user_management",
    "competition_management",
    "security_settings",
    "system_configuration",
  ],
  organizer: [
    "create_competitions",
    "manage_teams",
    "view_reports",
    "update_schedules",
  ],
  participant: [
    "join_competitions",
    "view_schedules",
    "submit_entries",
  ],
  judge: [
    "evaluate_entries",
    "view_submissions",
    "provide_feedback",
  ]
}