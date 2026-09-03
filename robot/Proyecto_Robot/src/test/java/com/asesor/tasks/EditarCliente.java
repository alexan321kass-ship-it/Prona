package com.asesor.tasks;

import com.asesor.userinterfaces.ClientesPage;
import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.actions.Click;
import net.serenitybdd.screenplay.actions.Clear;
import net.serenitybdd.screenplay.actions.Enter;
import static net.serenitybdd.screenplay.Tasks.instrumented;

public class EditarCliente implements Task {
    private final String nombreActual;
    private final String nuevoTelefono;

    public EditarCliente(String nombreActual, String nuevoTelefono) {
        this.nombreActual = nombreActual;
        this.nuevoTelefono = nuevoTelefono;
    }

    @Override
    public <T extends Actor> void performAs(T actor) {
        actor.attemptsTo(
            Click.on(ClientesPage.btnEditarCliente(nombreActual)),
            Clear.field(ClientesPage.INPUT_TELEFONO),
            Enter.theValue(nuevoTelefono).into(ClientesPage.INPUT_TELEFONO),
            Click.on(ClientesPage.BTN_GUARDAR)
        );
        try { Thread.sleep(1500); } catch (InterruptedException e) { e.printStackTrace(); }
    }

    public static EditarCliente conTelefono(String nombreActual, String nuevoTelefono) {
        return instrumented(EditarCliente.class, nombreActual, nuevoTelefono);
    }
}
