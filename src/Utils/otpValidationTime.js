const otpValidationTime = (startTime, endTime) => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  if (
    start.getFullYear() !== end.getFullYear() ||
    start.getMonth() !== end.getMonth() ||
    start.getDate() !== end.getDate()
  ) {
    return "Expire_otp";
  }

  const diffMinutes = Math.abs((end - start) / (1000 * 60));

  return diffMinutes <= 10 ? "Valid_Otp" : "Expire_otp";
}

export default otpValidationTime;