/** トラブルシューティング用の構造化エラーログ */

export function log_error(
  operation: string,
  context: Record<string, unknown>,
  error: unknown,
): void {
  console.error(
    JSON.stringify({
      level: 'error',
      operation,
      context,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    }),
  )
}

export function log_info(operation: string, context: Record<string, unknown>): void {
  console.info(
    JSON.stringify({
      level: 'info',
      operation,
      context,
      timestamp: new Date().toISOString(),
    }),
  )
}
