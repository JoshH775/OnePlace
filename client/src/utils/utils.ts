export function attachEventListener(
    selector: string,
    event: string,
    callback: (e: Event) => void
) {
    const elements = document.querySelectorAll(selector)
    elements.forEach((element) => {
        element.addEventListener(event, callback)
    })
}
