package com.artesanialegado.service;

import com.artesanialegado.dao.ArtesanoDao;
import com.artesanialegado.dto.Dtos;

public class ArtesanoService extends Mantenimiento<Dtos.Artesano> {
    public ArtesanoService(ArtesanoDao dao) { super(dao, Dtos.Artesano::from, "Artesano"); }
}
