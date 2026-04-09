export type ItemMenuSidebarAdmin = {
    group: string;
    items: {
        title: string;
        url: string;
        icon: string;
        isActive?: boolean;
        items?: {
            title: string;
            url: string;
        }[];
    }[]
}