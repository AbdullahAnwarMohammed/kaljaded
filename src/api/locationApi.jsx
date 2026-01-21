import Api from "../Services/Api";

export const getCities = () => {
    return Api.get("/cities");
};

export const getAreas = (cityId) => {
    return Api.get(`/areas/${cityId}`);
};
