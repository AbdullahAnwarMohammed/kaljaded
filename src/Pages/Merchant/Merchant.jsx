import { useEffect, useState } from "react";
import "./Merhant.css";
import { FaBuildingUser } from "react-icons/fa6";
import imgPlaceholder from "../../assets/merchmant.jpg";
import { Link } from "react-router-dom";
import Api from "../../Services/Api";

const Merchant = () => {
    const [merchants, setMerchants] = useState([]);
    const [meta, setMeta] = useState({});
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");


    const fetchMerchants = async (page = 1, search = "") => {
        try {
            const params = { page };
            if (search) params.search = search;

            const res = await Api.get("/merchants", { params });

            if (res.data.success) {
                setMerchants(res.data.data.data);
                setMeta(res.data.data.meta);
            } else {
                setMerchants([]);
                setMeta({});
            }
        } catch (error) {
            console.error("Error fetching merchants:", error.response?.data || error.message);
        }
    };

    useEffect(() => {
        fetchMerchants(page, search);
    }, [page, search]);

    return (
        <div className="merchant-page">
            <div className="merchant-page-app">
                <header>
                    <h4><FaBuildingUser /> التجـار {meta.total || 0}</h4>
                </header>

                {/* حقل البحث */}
                <div className="search-bar">
                    <input
                        type="text"
                        className="search-merchant"
                        placeholder="ابحث عن تاجر..."
                        value={search}
                        onChange={(e) => {
                            setPage(1); // العودة للصفحة 1 عند البحث
                            setSearch(e.target.value);
                        }}
                    />
                </div>

                <div className="items">
                    {merchants.length > 0 ? (
                        merchants.map((merchant) => (
                            <div className="item" key={merchant.id}>
                                <div className="image">
                                    <img
                                        src={merchant.image_vendor || imgPlaceholder}
                                        alt={merchant.name}
                                    />
                                </div>
                                <Link to={`/merchants/${merchant.slug}`}>
                                    {merchant.name_vendor || merchant.name}
                                </Link>

                                {/* <p>{merchant.phone_vendor || merchant.phone}</p> */}
                            </div>
                        ))
                    ) : (
                        <p>لا يوجد تجار مطابقون للبحث.</p>
                    )}
                </div>

                {/* Pagination */}
                <div className="pagination">
                    {meta.prev_page_url && (
                        <button className="btn btn-dark rounded-0" onClick={() => setPage(page - 1)}>السابق</button>
                    )}
                    <span>صفحة {meta.current_page || 0} من {meta.last_page || 0}</span>
                    {meta.next_page_url && (
                        <button className="btn btn-dark rounded-0" onClick={() => setPage(page + 1)}>التالي</button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Merchant;
