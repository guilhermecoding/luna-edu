import { Prisma } from "@/generated/prisma/client";

export type CourseWithRelations = Prisma.CourseGetPayload<{
    include: {
        subject: true;
        room: {
            include: {
                campus: true;
            };
        };
        period: true;
        schedules: {
            include: {
                timeSlot: true;
                teacher: {
                    select: {
                        id: true;
                        name: true;
                    };
                };
                room: {
                    include: {
                        campus: true;
                    };
                };
            };
        };
    };
}>;
