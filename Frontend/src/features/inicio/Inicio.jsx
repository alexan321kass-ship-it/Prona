import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import BarraPronavid from "../../compartido/components/BarraPronavid";
import "../../compartido/styles/inicio.css";

const HERO_URL = "https://cdn.pixabay.com/photo/2018/05/29/21/50/granola-3440204_1280.jpg";

export default function InicioPronavid() {
    const [imgLoaded, setImgLoaded] = useState(false);

    return (
        <div className="page">
            <BarraPronavid />

            <section className="hero" aria-label="Hero Pronavid">
                {/* Imagen con efecto fade al cargar */}
                <img
                    src={HERO_URL}
                    alt="Frutas y verduras - Pronavid"
                    className={`hero-img ${imgLoaded ? "visible" : "hidden"}`}
                    onLoad={() => setImgLoaded(true)}
                    crossOrigin="anonymous"
                />
                <div className="hero-overlay" />

                {/* Contenido con animación */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9 }}
                    className="hero-content"
                >
                    <h1 className="hero-title">
                        Comer bien, es verse bien, es sentirse bien, es alimentarse con Pronavid
                    </h1>

                    <div className="hero-buttons">
                        <Link to="/login" className="btn btn-login">Login</Link>
                        <Link to="/registro" className="btn btn-registro">Registro</Link>
                    </div>
                </motion.div>
            </section>
        </div>
    );
}