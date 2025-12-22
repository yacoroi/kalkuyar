import TopicReportDetail from "@/components/TopicReportDetail";

export default async function TopicReportPage({ params }: { params: Promise<{ topic: string }> }) {
    const { topic } = await params;
    return <TopicReportDetail topic={topic} />;
}
