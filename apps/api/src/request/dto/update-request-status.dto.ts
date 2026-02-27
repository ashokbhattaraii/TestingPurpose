import { $Enums } from '@prisma/client';

export class UpdateRequestStatusDto {
    status: $Enums.RequestStatus;
    rejectionReason?: string;
    adminNotes?: string;
}
