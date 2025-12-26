import React from 'react';

interface WebPullToRefreshProps {
    children: React.ReactNode;
    onRefresh: () => Promise<void>;
    refreshing?: boolean;
}

/**
 * WebPullToRefresh - Web platformunda pull-to-refresh çalışmadığı için
 * basitçe children'ı render eder. Native platformlarda da aynı.
 * 
 * Pull-to-refresh özelliği her ekrandaki RefreshControl ile sağlanır.
 * Web'de RefreshControl çalışmaz, ancak bu beklenen bir durumdur.
 */
export function WebPullToRefresh({ children }: WebPullToRefreshProps) {
    // Sadece children'ı render et - pull-to-refresh native RefreshControl ile sağlanıyor
    return <>{children}</>;
}
