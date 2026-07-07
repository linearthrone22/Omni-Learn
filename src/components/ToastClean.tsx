import { CheckCircle2, CircleAlert } from 'lucide-react';

interface Props {
  message: string;
  ok?: boolean;
}

export function ToastClean({ message, ok = true }: Props) {
  const Icon = ok ? CheckCircle2 : CircleAlert;
  return (
    <div className="toast on">
      <span className="ts" style={{ color: ok ? 'var(--emerald)' : '#ff9a9a' }}>
        <Icon size={16} />
      </span>
      <span>{message}</span>
    </div>
  );
}
