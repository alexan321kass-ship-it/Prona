package com.producto.questions;

import com.producto.userinterfaces.CatalogoPage;
import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.Question;
import net.serenitybdd.screenplay.questions.Visibility;

public class ElProductoEnGrilla implements Question<Boolean> {
    private final String nombre;

    public ElProductoEnGrilla(String nombre) {
        this.nombre = nombre;
    }

    @Override
    public Boolean answeredBy(Actor actor) {
        return Visibility.of(CatalogoPage.nombreProducto(nombre)).answeredBy(actor);
    }

    public static ElProductoEnGrilla esVisible(String nombre) {
        return new ElProductoEnGrilla(nombre);
    }
}
