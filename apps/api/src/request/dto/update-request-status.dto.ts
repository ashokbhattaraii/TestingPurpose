import { RequestStatus } from '@prisma/client';

export class UpdateRequestStatusDto {
    status: RequestStatus;
    rejectionReason?: string;
    adminNotes?: string;
}
