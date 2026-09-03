import { ShoppingCart } from "lucide-react";

export default function Header() {
    return (
        <header className="catalogo-header">
            <h1><ShoppingCart size={24} className="inline-block mr-2" /> Catálogo de Productos Pronavid</h1>
        </header>
    );
}
