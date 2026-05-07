export type ItemMenuSidebarAdmin = {
    group: string;
    visibleOnPaths?: string[];
    hiddenOnPaths?: string[];
    items: {
        title: string;
        url: string;
        icon: string;
        isActive?: boolean;
        visibleOnPaths?: string[];
        hiddenOnPaths?: string[];
        items?: {
            title: string;
            url: string;
            visibleOnPaths?: string[];
            hiddenOnPaths?: string[];
        }[];
    }[]
}