import { Shell } from '@/components/layout/shell'
import { FloatingDialer } from '@/components/floating-dialer'
import { ModalProvider } from '@/contexts/modal-context'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ModalProvider>
      <Shell>{children}</Shell>
      <FloatingDialer />
    </ModalProvider>
  )
}
