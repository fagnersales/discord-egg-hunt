export function weird_date_format(date: Date): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    const timezone_offset = -date.getTimezoneOffset() / 60
    const timezone_offset_string =
        (timezone_offset >= 0 ? '+' : '-') +
        String(Math.abs(timezone_offset)).padStart(2, '0') +
        ':00'

    const weirdly_formatted_date = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.000${timezone_offset_string}`

    return weirdly_formatted_date
}