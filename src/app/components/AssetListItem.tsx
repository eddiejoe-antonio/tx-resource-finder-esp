import React, { useState } from 'react';
import { MapPinIcon, BookmarkIcon, EllipsisVerticalIcon, LinkIcon } from '@heroicons/react/24/outline';
import { AssetListItemProps } from '../types/assetInventoryTypes';
import { jsPDF } from 'jspdf';

const AssetListItem: React.FC<AssetListItemProps> = ({ resource }) => {
  const [showMore, setShowMore] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const formatType = (type: string | string[]) => {
    return Array.isArray(type) ? type.join(', ') : type;
  };

  const formatWebsite = (url: string | undefined | null) => {
    if (!url) {
      return '';
    }
    return !url.startsWith('https://') && !url.startsWith('http://') ? `https://${url}` : url;
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 10;
    const maxWidth = pageWidth - 2 * margin;
    let yPosition = 10;

    doc.setFontSize(18);
    doc.text(resource.Asset, margin, yPosition);
    yPosition += 10;

    doc.setFontSize(12);

    const addWrappedText = (text: string) => {
      const lines = doc.splitTextToSize(text, maxWidth);
      doc.text(lines, margin, yPosition);
      yPosition += lines.length * 6;
    };

    addWrappedText(`Ubicación: ${formatType(resource.County)}`);
    addWrappedText(`Tipo de servicio: ${formatType(resource.Organization_Sub_Type)}`);
    if (resource.Website) addWrappedText(`Sitio web: ${formatWebsite(resource.Website)}`);
    if (resource.Asset_Description) addWrappedText(`Descripción: ${resource.Asset_Description}`);
    addWrappedText(`Poblaciones atendidas: ${formatType(resource.Asset_Covered_Population)}`);
    if (resource.Key_Contact) addWrappedText(`Contacto: ${resource.Key_Contact}`);
    if (resource.Contact_Email) addWrappedText(`Correo electrónico: ${resource.Contact_Email}`);

    doc.save(`${resource.Asset}.pdf`);
  };

  return (
<div className="flex flex-col border-b border-[#3B75A9] transition-all ease-in-out duration-300 relative">
  <div className="absolute top-2 right-2">
    <button onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Open menu">
      <EllipsisVerticalIcon className="h-6 w-6 text-[#98A2B3]" />
    </button>
    {isMenuOpen && (
      <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-300 rounded-lg shadow-lg">
        <button
          onClick={downloadPDF}
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
        >
          Descargar PDF
        </button>
      </div>
    )}
  </div>

  <div className="text-black py-2">
    <h2 className="mt-1 font-bold text-lg">{resource.Asset}</h2>
  </div>
  <div className="flex items-center text-md py-2 text-[#0E3052]">
    <MapPinIcon className="h-6 w-6 mr-2 flex-shrink-0 [stroke-width:2]" />
    {formatType(resource.County)}
  </div>
  <div className="flex items-center text-md py-2 text-[#0E3052]">
    <BookmarkIcon className="h-6 w-6 mr-2 flex-shrink-0 [stroke-width:2]" />
    <div className="flex-grow min-w-0 whitespace-normal break-words">
      {formatType(resource.Organization_Sub_Type)}
    </div>
  </div>
  <div className="flex items-center text-md py-2 text-[#0E3052]">
    <LinkIcon className="h-6 w-6 mr-2 flex-shrink-0 [stroke-width:2]" />
    {resource.Website && (
      <a
        href={formatWebsite(resource.Website)}
        target="_blank"
        rel="noopener noreferrer"
        className="md:hover:text-[#1E79C8] md:hover:underline transition ease-in-out duration-300 flex-grow min-w-0 whitespace-normal break-words"
      >
        {resource.Website}
      </a>
    )}
  </div>

  {/* Learn More Button */}
  <div className="pt-4 pb-6">
    <button
      aria-label={`Más información sobre ${resource.Asset}`}
      onClick={() => setShowMore(!showMore)}
      className="border border-[#0E3052] bg-white text-[#0E3052] hover:bg-[#0E3052] hover:text-white text-lg cursor-pointer px-12 py-2 rounded-full transition-colors duration-300 flex items-center justify-center gap-2 font-semibold"
    >
      {showMore ? <>Esconder</> : <>Más Información</>}
    </button>
    {showMore && (
      <div className="my-4 text-md">
        <div className="my-4">
          <p className="my-2 font-semibold">Descripción</p>
          <p className="whitespace-normal break-words">{resource.Asset_Description}</p>
        </div>
        <div className="my-4">
          <p className="my-2 font-semibold">Poblaciones atendidas</p>
          <p className="whitespace-normal break-words">{formatType(resource.Asset_Covered_Population)}</p>
        </div>
        <div className="my-4">
          <p className="my-2 font-semibold">Información del contacto</p>
          <p className="whitespace-normal break-words">{resource.Key_Contact}</p>
          {resource.Contact_Email && (
            <p className="whitespace-normal break-words">
              <a
                href={`mailto:${resource.Contact_Email}`}
                target="_blank"
                rel="noopener noreferrer"
                className="md:hover:text-[#1E79C8] transition-colors ease-in-out duration-300 flex-grow min-w-0 whitespace-normal break-words"
              >
                {resource.Contact_Email}
              </a>
            </p>
          )}
        </div>
      </div>
    )}
  </div>
</div>
  );
};

export default AssetListItem;
