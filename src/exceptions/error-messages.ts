import { ErrorCode } from './error-code';

export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ErrorCode.USER_NOT_FOUND]: 'User not found',
  [ErrorCode.TRAINING_NOT_FOUND]: 'Training not found',
  [ErrorCode.TRAINING_TOPIC_NOT_FOUND]: 'Training topic not found',
  [ErrorCode.TRAINING_LEVEL_NOT_FOUND]: 'Training level not found',
  [ErrorCode.STRING_NOT_LINK_BAD_REQUEST]: 'String not link bad request',
  [ErrorCode.PAGE_TYPE_BAD_REQUEST]: 'Page type bad request',
  [ErrorCode.FILE_NOT_IMAGE_BAD_REQUEST]: 'File not image bad request',
  [ErrorCode.CURRENT_PASSWORD_NOT_MATCH]: 'Current password is not match',
  [ErrorCode.PASSWORD_IS_NOT_STRONG]: 'Password is not strong enough',
  [ErrorCode.USERNAME_PASSWORD_INVALID]:
    'Invalid username or password. Please try again.',
  [ErrorCode.DURATION_LIMIT_BAD_REQUEST]:
    'You have reached the maximum 8 training hours for this day.',
  [ErrorCode.TRAINING_DATE_BAD_REQUEST]:
    'Can not select the date after the current date.',
  [ErrorCode.EMAIL_DOES_NOT_EXIST]: 'Email does not exist.',
  [ErrorCode.EMAIL_IS_EXISTED]: 'Email is existed.',
  [ErrorCode.POSITION_DOES_NOT_EXIST]: 'Position does not exist.',
  [ErrorCode.TRAINING_CAN_NOT_BE_CHANGED]:
    'The report can not be deleted or updated after 1 week',
  [ErrorCode.LEVEL_DOES_NOT_EXIST]: 'Level does not exist',
  [ErrorCode.DATE_FROM_INVALID]:
    'Date from must be equal to or after the current date',
  [ErrorCode.DATE_TO_INVALID]:
    'Date to must be equal to or after the current date',
  [ErrorCode.DATE_TO_BEFORE_DATE_FROM]:
    'Date to must be equal to or after the date from',
  [ErrorCode.INVALID_HALF_DAY_SELECTION_WHEN_FROM_AND_TO_DIFFERENT]:
    'Cannot select Half Day if date from and date to are different',
  [ErrorCode.TIME_OFF_TYPE_REQUEST_NOT_FOUND]:
    'Time-off type request not found',
  [ErrorCode.TIME_OFF_REQUEST_NOT_FOUND]: 'Time-off request not found',
  [ErrorCode.REQUESTED_DURATION_GREATER_THAN_CURRENT_TIME_OFF_BALANCE]:
    'Requested duration is greater than current time-off balance.',
  [ErrorCode.CURRENT_TIME_OFF_BALANCE_IS_ZERO]:
    'Your current time-off balance is 0 day.',
  [ErrorCode.INVALID_REQUEST_DELETED]: 'Only pending requests can be deleted',
  [ErrorCode.WFH_REQUEST_NOT_FOUND]: 'Wfh request not found',
  [ErrorCode.COACHES_TRAINING_CANNOT_EXCEED_THREE]:
    'Coaches in a training cannot exceed 3',
  [ErrorCode.CANNOT_COACH_SAME_USER_FROM_TRAINING]:
    'Cannot coach the same user from the training',
  [ErrorCode.COACHES_IN_TRAINING_CANNOT_DUPLICATED]:
    'Coaches in one training cannot be duplicated',
  [ErrorCode.ONLY_ALPHABETIC_ARE_ALLOWED]:
    'Only alphabetic characters are allowed',
  [ErrorCode.MODEL_CAN_NOT_BE_DELETED]:
    'Cannot delete model that is assigned with a device',
  [ErrorCode.TYPE_CAN_NOT_BE_DELETED]:
    'Cannot delete type that is assigned with a device',
  [ErrorCode.DEVICE_NOT_FOUND]: 'Device not found',
  [ErrorCode.DEVICE_MODEL_NOT_FOUND]: 'Device model not found',
  [ErrorCode.DEVICE_TYPE_NOT_FOUND]: 'Device type not found',
  [ErrorCode.DEVICE_MODEL_DOES_NOT_BELONG_TO_DEVICE_TYPE]:
    'Device model does not belong to device type',
  [ErrorCode.CANNOT_ASSIGN_ANOTHER_USER_TO_AN_ALREADY_ASSIGNED_DEVICE]:
    'Cannot assign another user to an already assigned device',
  [ErrorCode.USER_NOT_TRAINING_OWNER]:
    'The report can be deleted or updated by the creator only.',
  [ErrorCode.CANNOT_SELECT_REPAIR_DATE_IN_FUTURE]:
    'Cannot select the repair date after the current date',
  [ErrorCode.DEVICE_REPAIR_HISTORY_NOT_FOUND]:
    'Device repair history not found',
  [ErrorCode.CANNOT_DELETE_WHEN_STATUS_ASSIGN]:
    'Cannot delete a device with status as assigned',
  [ErrorCode.CANNOT_DELETE_WHEN_HAVE_DEVICE_ASSIGN_HISTORY]:
    'Cannot delete a device with assigned history',
  [ErrorCode.CANNOT_DELETE_WHEN_HAVE_DEVICE_REPAIR_HISTORY]:
    'Cannot delete a device with repaired history',
  [ErrorCode.CANNOT_RETURN_DEVICE_WHEN_CURRENT_STATUS_AVAILABLE]:
    'Cannot return the device when the current status is available',
  [ErrorCode.TYPE_IS_EXISTED]: 'Device type is existed',
  [ErrorCode.MODEL_IS_EXISTED]: 'Device model is existed',
  [ErrorCode.REPAIR_REQUEST_NOT_FOUND]: 'Repair request not found',
};
