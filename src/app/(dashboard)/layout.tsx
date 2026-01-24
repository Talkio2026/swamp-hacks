import { Shell } from '@/components/layout/shell'
import { FloatingDialer } from '@/components/floating-dialer'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Shell>{children}</Shell>
      <FloatingDialer />
    </>
  )
}
