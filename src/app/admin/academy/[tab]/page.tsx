import { AcademyAdminPage } from '@/features/academy/admin-page';

export const dynamic = 'force-dynamic';

export default async function AcademyTabPage({ params }: { params: Promise<{ tab: string }> }) {
  const { tab } = await params;
  return <AcademyAdminPage tab={tab} />;
}
