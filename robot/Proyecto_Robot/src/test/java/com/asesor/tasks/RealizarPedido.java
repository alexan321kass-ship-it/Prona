package com.asesor.tasks;

import com.asesor.userinterfaces.PedidosPage;
import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.actions.Click;
import net.serenitybdd.screenplay.actions.Enter;
import static net.serenitybdd.screenplay.Tasks.instrumented;

/**
 * Selecciona un cliente en el SelectorCliente del módulo de Pedidos,
 * agrega un producto al carrito, y confirma el pedido.
 */
public class RealizarPedido implements Task {
    private final String nombreCliente;
    private final String nombreProducto;

    public RealizarPedido(String nombreCliente, String nombreProducto) {
        this.nombreCliente = nombreCliente;
        this.nombreProducto = nombreProducto;
    }

    @Override
    public <T extends Actor> void performAs(T actor) {
        // 1. Buscar y seleccionar el cliente
        actor.attemptsTo(
            Enter.theValue(nombreCliente).into(PedidosPage.INPUT_SELECTOR_CLIENTE),
            Click.on(PedidosPage.opcionCliente(nombreCliente))
        );
        try { Thread.sleep(1000); } catch (InterruptedException e) { e.printStackTrace(); }

        // 2. Buscar el producto en el buscador del grid para que aparezca en el dropdown
        actor.attemptsTo(
            Enter.theValue(nombreProducto).into(PedidosPage.INPUT_BUSCAR_PRODUCTO)
        );
        try { Thread.sleep(1000); } catch (InterruptedException e) { e.printStackTrace(); }

        // 3. Hacer clic en "+" del dropdown de sugerencias (más estable que las tarjetas animadas)
        actor.attemptsTo(
            net.serenitybdd.screenplay.actions.JavaScriptClick.on(PedidosPage.btnAgregarDesdeDropdown(nombreProducto))
        );
        // El carrito se abre automáticamente al agregar el producto, esperamos a que termine su animación
        try { Thread.sleep(1500); } catch (InterruptedException e) { e.printStackTrace(); }

        // 4. Confirmar pedido
        actor.attemptsTo(
            net.serenitybdd.screenplay.actions.Scroll.to(PedidosPage.BTN_CONFIRMAR_PEDIDO),
            Click.on(PedidosPage.BTN_CONFIRMAR_PEDIDO)
        );
        try { Thread.sleep(2000); } catch (InterruptedException e) { e.printStackTrace(); }
    }

    public static RealizarPedido para(String nombreCliente, String nombreProducto) {
        return instrumented(RealizarPedido.class, nombreCliente, nombreProducto);
    }
}
