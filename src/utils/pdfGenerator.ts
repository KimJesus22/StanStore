import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface OrderItem {
    name: string;
    quantity: number;
    price: number;
}

interface ContractData {
    orderId: string;
    customerName: string; // Or Email
    items: OrderItem[];
    total: number;
    date: Date;
    legalMetadata: {
        agreedAt: string; // ISO String
        userAgent: string;
        ip?: string;
    };
}

export const generateContractPDF = (data: ContractData) => {
    const doc = new jsPDF();
    const lineHeight = 7;
    let y = 20;

    // --- Header ---
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("CONTRATO DE COMPRA-VENTA MERCANTIL", 105, y, { align: "center" });
    y += 15;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Folio de Orden: ${data.orderId}`, 20, y);
    doc.text(`Fecha de Emisión: ${format(data.date, "PPP", { locale: es })}`, 140, y);
    y += 15;

    // --- Parties ---
    doc.setFont("helvetica", "bold");
    doc.text("REUNIDOS", 20, y);
    y += 8;
    doc.setFont("helvetica", "normal");
    doc.text("DE UNA PARTE, StanStore S.A. de C.V. (en adelante, el \"VENDEDOR\").", 20, y);
    y += 6;
    doc.text(`DE OTRA PARTE, ${data.customerName || "El Cliente"} (en adelante, el \"COMPRADOR\").`, 20, y);
    y += 15;

    // --- Clauses ---
    doc.setFont("helvetica", "bold");
    doc.text("CLÁUSULAS", 20, y);
    y += 8;

    const clauses = [
        "PRIMERA. OBJETO. El VENDEDOR transfiere la propiedad de los artículos descritos a continuación al COMPRADOR, quien acepta pagar el precio estipulado.",
        "SEGUNDA. PRECIO. El precio total de la operación es el indicado en el resumen de compra, impuestos incluidos.",
        "TERCERA. ENTREGAS. El VENDEDOR se compromete a entregar los bienes en el domicilio indicado por el COMPRADOR en un plazo razonable.",
        "CUARTA. DEVOLUCIONES. Conforme al artículo 56 de la Ley Federal de Protección al Consumidor, el COMPRADOR tiene un plazo de 5 días hábiles para revocar su consentimiento sin responsabilidad alguna.",
        "QUINTA. GARANTÍA. Los productos cuentan con garantía contra defectos de fabricación por 90 días naturales.",
        "SEXTA. ACEPTACIÓN DIGITAL. Las partes reconocen la validez de la firma electrónica y la aceptación de términos mediante medios digitales como prueba plena de consentimiento."
    ];

    doc.setFontSize(9);
    clauses.forEach((clause) => {
        const splitText = doc.splitTextToSize(clause, 170);
        doc.text(splitText, 20, y);
        y += (splitText.length * 5) + 3;
    });
    y += 5;

    // --- Order Details ---
    doc.setFont("helvetica", "bold");
    doc.text("DETALLE DE LA COMPRA", 20, y);
    y += 8;

    data.items.forEach((item) => {
        const itemText = `${item.quantity}x ${item.name} - $${item.price.toFixed(2)} MXN`;
        doc.setFont("helvetica", "normal");
        doc.text(itemText, 20, y);
        y += 6;
    });

    y += 4;
    doc.setFont("helvetica", "bold");
    doc.text(`TOTAL: $${data.total.toFixed(2)} MXN`, 140, y);
    y += 20;

    // --- Digital Signature Section ---
    doc.setDrawColor(200, 200, 200);
    doc.line(20, y, 190, y);
    y += 10;

    doc.setFontSize(11);
    doc.setTextColor(0, 50, 150); // Blue for "digital" feel
    doc.text("FIRMA DIGITAL Y TRAZABILIDAD", 20, y);
    y += 8;

    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    doc.text(`Aceptado el: ${data.legalMetadata.agreedAt}`, 20, y);
    y += 5;
    doc.text(`Hash de Aceptación (Simulado): ${btoa(data.legalMetadata.agreedAt + data.orderId).substring(0, 32)}`, 20, y);
    y += 5;
    doc.text(`Dispositivo: ${data.legalMetadata.userAgent}`, 20, y);
    y += 5;
    doc.text("Este documento es una representación impresa de una transacción digital válida.", 20, y);

    // Save
    doc.save(`Contrato_CompraVenta_${data.orderId.substring(0, 8)}.pdf`);
};
