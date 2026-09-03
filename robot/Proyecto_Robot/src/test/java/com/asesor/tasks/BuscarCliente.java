package com.asesor.tasks;

import com.asesor.userinterfaces.ClientesPage;
import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.actions.Enter;
import static net.serenitybdd.screenplay.Tasks.instrumented;

public class BuscarCliente implements Task {
    private final String termino;

    public BuscarCliente(String termino) {
        this.termino = termino;
    }

    @Override
    public <T extends Actor> void performAs(T actor) {
        actor.attemptsTo(
            Enter.theValue(termino).into(ClientesPage.BARRA_BUSQUEDA)
        );
        try { Thread.sleep(1500); } catch (InterruptedException e) { e.printStackTrace(); }
    }

    public static BuscarCliente conTermino(String termino) {
        return instrumented(BuscarCliente.class, termino);
    }
}
