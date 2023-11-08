import { DateType, RequestStatusType } from '../../../constants';
import { ErrorCode, InvalidBadRequestException } from '../../../exceptions';
import { DateProvider } from '../../../providers';
import type { CreateTimeOffRequestDto } from '../dtos/create-time-off-request.dto';

export default class AttendanceValidator {
  validateDate(dateFrom: Date, dateTo: Date, dateType: string): void {
    const currentDate = DateProvider.extractCurrentDate();
    const dateFromInTime = DateProvider.extractDateFrom(dateFrom);
    const dateToInTime = DateProvider.extractDateTo(dateTo);

    if (dateFromInTime < currentDate) {
      throw new InvalidBadRequestException(ErrorCode.DATE_FROM_INVALID);
    }

    if (dateToInTime < currentDate) {
      throw new InvalidBadRequestException(ErrorCode.DATE_TO_INVALID);
    }

    if (dateToInTime < dateFromInTime) {
      throw new InvalidBadRequestException(ErrorCode.DATE_TO_BEFORE_DATE_FROM);
    }

    if (
      dateFromInTime !== dateToInTime &&
      (dateType as DateType) === DateType.HALF_DAY
    ) {
      throw new InvalidBadRequestException(
        ErrorCode.INVALID_HALF_DAY_SELECTION_WHEN_FROM_AND_TO_DIFFERENT,
      );
    }
  }

  validateHoursAndDateType(
    createTimeOffRequest: CreateTimeOffRequestDto,
  ): void {
    const dateFrom = DateProvider.extractDateFrom(
      createTimeOffRequest.dateFrom,
    );
    const dateTo = DateProvider.extractDateTo(createTimeOffRequest.dateTo);
    const dateType = createTimeOffRequest.dateType;

    if (dateFrom !== dateTo && (dateType as DateType) === DateType.HALF_DAY) {
      throw new InvalidBadRequestException(
        ErrorCode.INVALID_HALF_DAY_SELECTION_WHEN_FROM_AND_TO_DIFFERENT,
      );
    }
  }

  validateRequestIsPending(status: string): void {
    if ((status as RequestStatusType) !== RequestStatusType.PENDING) {
      throw new InvalidBadRequestException(ErrorCode.INVALID_REQUEST_DELETED);
    }
  }
}
