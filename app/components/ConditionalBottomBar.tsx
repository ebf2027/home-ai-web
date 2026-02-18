"use client";

import { usePathname } from "next/navigation";
import BottomTabs from "./BottomTabs";

export default function ConditionalBottomBar() {
    const pathname = usePathname();

    // Lista de páginas onde a barra NÃO deve aparecer
    const hiddenPaths = ["/login", "/signup", "/forgot-password"];

    // Se a página atual estiver na lista, não mostra nada (null)
    if (hiddenPaths.includes(pathname)) {
        return null;
    }

    // Caso contrário, mostra a barra normalmente
    return <BottomTabs />;
}