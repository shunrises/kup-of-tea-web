import saveAs from 'file-saver'
import html2canvas from 'html2canvas'

export const downloadImage = (id: string, ticker: string) => {
  const element = document.getElementById(id)

  if (!element) {
    console.error(`Element with id "${id}" not found`)
    return
  }

  html2canvas(element as HTMLElement, {
    useCORS: true,
    logging: false,
    allowTaint: true,
  }).then((canvas: HTMLCanvasElement) => {
    canvas.toBlob((blob: Blob | null) => {
      if (blob) {
        saveAs(blob, `${ticker}.png`)
      }
    })
  })
}
