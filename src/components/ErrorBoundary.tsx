import { Component, type ErrorInfo, type ReactNode } from 'react'
import { log_error } from '@/lib/logger'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
}

interface State {
  has_error: boolean
  error_message: string
}

/** 画面クラッシュ時にコンポーネント名と操作状態をコンソールへ出力する */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { has_error: false, error_message: '' }
  }

  static getDerivedStateFromError(error: Error): State {
    return { has_error: true, error_message: error.message }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    log_error('ErrorBoundary', { component_stack: info.componentStack }, error)
  }

  render() {
    if (this.state.has_error) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
          <h1 className="text-xl font-semibold text-destructive">エラーが発生しました</h1>
          <p className="text-muted-foreground">{this.state.error_message}</p>
          <Button onClick={() => window.location.reload()}>ページを再読み込み</Button>
        </div>
      )
    }
    return this.props.children
  }
}
