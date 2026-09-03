package com.asesor.questions;

import com.asesor.userinterfaces.ClientesPage;
import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.Question;
import net.serenitybdd.screenplay.questions.Visibility;

public class ElClienteEnTabla implements Question<Boolean> {
    private final String nombre;

    public ElClienteEnTabla(String nombre) {
        this.nombre = nombre;
    }

    @Override
    public Boolean answeredBy(Actor actor) {
        return Visibility.of(ClientesPage.filaNombreCliente(nombre)).answeredBy(actor);
    }

    public static ElClienteEnTabla esVisible(String nombre) {
        return new ElClienteEnTabla(nombre);
    }
}
