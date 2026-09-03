package com.producto.tasks;

import com.producto.userinterfaces.CatalogoPage;
import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.actions.Enter;
import static net.serenitybdd.screenplay.Tasks.instrumented;

/**
 * TASK: Busca un producto usando la barra de búsqueda del catálogo.
 */
public class BuscarProducto implements Task {
    private final String termino;

    public BuscarProducto(String termino) {
        this.termino = termino;
    }

    @Override
    public <T extends Actor> void performAs(T actor) {
        actor.attemptsTo(
            Enter.theValue(termino).into(CatalogoPage.BARRA_BUSQUEDA)
        );
        try { Thread.sleep(1500); } catch (InterruptedException e) { e.printStackTrace(); }
    }

    public static BuscarProducto conTermino(String termino) {
        return instrumented(BuscarProducto.class, termino);
    }
}
