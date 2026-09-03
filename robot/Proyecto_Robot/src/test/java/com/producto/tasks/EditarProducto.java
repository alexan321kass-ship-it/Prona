package com.producto.tasks;

import com.producto.userinterfaces.CatalogoPage;
import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.actions.Click;
import net.serenitybdd.screenplay.actions.Clear;
import net.serenitybdd.screenplay.actions.Enter;
import static net.serenitybdd.screenplay.Tasks.instrumented;

public class EditarProducto implements Task {
    private final String nombreActual;
    private final String nuevoPrecio;

    public EditarProducto(String nombreActual, String nuevoPrecio) {
        this.nombreActual = nombreActual;
        this.nuevoPrecio = nuevoPrecio;
    }

    @Override
    public <T extends Actor> void performAs(T actor) {
        actor.attemptsTo(
            Click.on(CatalogoPage.btnEditarProducto(nombreActual)),
            Clear.field(CatalogoPage.INPUT_PRECIO),
            Enter.theValue(nuevoPrecio).into(CatalogoPage.INPUT_PRECIO),
            Click.on(CatalogoPage.BTN_GUARDAR)
        );
        try { Thread.sleep(1500); } catch (InterruptedException e) { e.printStackTrace(); }
    }

    public static EditarProducto conPrecio(String nombreActual, String nuevoPrecio) {
        return instrumented(EditarProducto.class, nombreActual, nuevoPrecio);
    }
}
