package com.asesor.userinterfaces;

import net.serenitybdd.screenplay.targets.Target;
import org.openqa.selenium.By;

/**
 * Mapa de UI: Pedidos — /Pedidos
 *
 * ESTRATEGIA DE SELECCIÓN DE PRODUCTO:
 *   En lugar de hacer clic en las tarjetas animadas (Framer Motion desplaza
 *   el elemento en el hover y el robot falla), usamos el buscador del grid:
 *   1. Escribir en el buscador → aparece un dropdown de sugerencias
 *   2. Clic en el botón "+" del dropdown (más estable que la tarjeta)
 */
public class PedidosPage {

    // Selector de cliente (SelectorCliente.jsx)
    public static final Target INPUT_SELECTOR_CLIENTE = Target.the("Input buscador de cliente en pedidos")
            .located(By.cssSelector("input.selector-cliente__input"));

    public static Target opcionCliente(String nombre) {
        return Target.the("Opción de cliente " + nombre + " en el dropdown")
                .located(By.xpath("//div[contains(@class,'selector-cliente__opcion')]//span[contains(text(),'" + nombre + "')]"));
    }

    // Buscador interno del GridProductos
    public static final Target INPUT_BUSCAR_PRODUCTO = Target.the("Buscador de producto en la grilla")
            .located(By.cssSelector("input.grid-buscador__input"));

    // Botón "+" del dropdown de sugerencias del buscador
    public static Target btnAgregarDesdeDropdown(String nombre) {
        return Target.the("Botón + del dropdown para " + nombre)
                .located(By.xpath(
                    "//div[contains(@class,'grid-dropdown__item')]" +
                    "[.//div[contains(@class,'grid-dropdown__item-nombre') and contains(text(),'" + nombre + "')]]" +
                    "//button[contains(@class,'grid-dropdown__item-boton')]"
                ));
    }

    // Botón flotante para abrir el carrito
    public static final Target BTN_ABRIR_CARRITO = Target.the("Botón flotante del carrito")
            .located(By.cssSelector("button.boton-carrito-flotante"));

    // PanelCarrito: botones de confirmar pedido y generar cotización
    public static final Target BTN_CONFIRMAR_PEDIDO = Target.the("Botón Confirmar Pedido")
            .located(By.cssSelector("button.carrito-sidebar__boton-confirmar"));

    public static final Target BTN_GENERAR_COTIZACION = Target.the("Botón Generar Cotización")
            .located(By.cssSelector("button.carrito-sidebar__boton-cotizacion"));

    // Mensaje de éxito en la página
    public static final Target MENSAJE_EXITO = Target.the("Mensaje de éxito del pedido")
            .located(By.cssSelector("div.seg-mensaje.success"));
}

