
export default function timeLeftInfo(deadline: number) {
    let timeLeft = deadline - Date.now();
    if (timeLeft <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, end: true };
    let days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    let hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    let minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    return { days, hours, minutes, seconds, end: false };
}