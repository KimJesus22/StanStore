import React from 'react';

interface EmptyStateProps {
    /** Título principal del estado vacío */
    title: string;
    /** Descripción o mensaje secundario */
    description: string;
    /** Icono a mostrar (ReactNode, ej: un componente SVG) */
    icon: React.ReactNode;
    /** Botón de acción opcional */
    action?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({ title, description, icon, action }) => {
    return (
        <div className="flex flex-col items-center justify-center text-center p-8">
            <div className="w-24 h-24 text-gray-300 dark:text-gray-600 [&>svg]:w-full [&>svg]:h-full">
                {icon}
            </div>
            <h3 className="text-xl font-semibold mt-4">{title}</h3>
            <p className="text-gray-500 mt-2">{description}</p>
            {action && <div className="mt-6">{action}</div>}
        </div>
    );
};

export default EmptyState;
