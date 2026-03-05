import 'vue-router'
declare module 'vue-router' {
  interface RouteMeta {
    action?: string
    subject?: string
    layoutWrapperClasses?: string
    navActiveLink?: RouteLocationRaw
    layout?: 'blank' | 'default'
    unauthenticatedOnly?: boolean
    public?: boolean
  }
}

declare module 'html2pdf.js' {
  interface Html2PdfOptions {
    margin?: number | number[];
    filename?: string;
    image?: {
      type?: string;
      quality?: number;
    };
    html2canvas?: {
      scale?: number;
      useCORS?: boolean;
      allowTaint?: boolean;
      letterRendering?: boolean;
      scrollX?: number;
      scrollY?: number;
      backgroundColor?: string;
      width?: number;
      height?: number;
    };
    jsPDF?: {
      unit?: string;
      format?: string | number[];
      orientation?: string;
      compress?: boolean;
    };
    pagebreak?: {
      mode?: string | string[];
      before?: string | string[];
      after?: string | string[];
      avoid?: string | string[];
    };
  }

  interface Html2Pdf {
    set(options: Html2PdfOptions): Html2Pdf;
    from(element: Element): Html2Pdf;
    toPdf(): Html2Pdf;
    output(type: 'blob'): Promise<Blob>;
    output(type: 'datauristring'): Promise<string>;
    output(type: 'arraybuffer'): Promise<ArrayBuffer>;
    save(filename?: string): Promise<void>;
  }

  function html2pdf(): Html2Pdf;
  function html2pdf(element: Element): Html2Pdf;
  function html2pdf(element: Element, options: Html2PdfOptions): Html2Pdf;

  export default html2pdf;
}
