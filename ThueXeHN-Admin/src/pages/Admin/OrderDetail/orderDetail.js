import {
    DeleteOutlined,
    EditOutlined,
    HomeOutlined,
    ShoppingCartOutlined
} from '@ant-design/icons';
import {
    BackTop,
    Breadcrumb,
    Button,
    Empty,
    Form,
    Popconfirm,
    Row,
    Spin,
    Tag,
    notification
} from 'antd';
import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import orderApi from "../../../apis/orderApi";
import "./orderDetail.css";

const OrderDetail = () => {

    const [order, setOrder] = useState([]);
    const [openModalUpdate, setOpenModalUpdate] = useState(false);
    const [loading, setLoading] = useState(true);
    const [form] = Form.useForm();
    const [form2] = Form.useForm();
    const [total, setTotalList] = useState();
    const [currentPage, setCurrentPage] = useState(1);
    const { id } = useParams();

    const history = useHistory();


    const handleCategoryList = async () => {
        try {
            await orderApi.getListOrder({ page: 1, limit: 10000 }).then((res) => {
                setTotalList(res.totalDocs)
                setOrder(res.data.docs);
                setLoading(false);
            });
            ;
        } catch (error) {
            console.log('Failed to fetch event list:' + error);
        };
    }

    const handleDeleteCategory = async (id) => {
        setLoading(true);
        try {
            await orderApi.deleteOrder(id).then(response => {
                if (response === undefined) {
                    notification["error"]({
                        message: `Thông báo`,
                        description:
                            'Xóa danh mục thất bại',

                    });
                    setLoading(false);
                }
                else {
                    notification["success"]({
                        message: `Thông báo`,
                        description:
                            'Xóa danh mục thành công',

                    });
                    setCurrentPage(1);
                    handleCategoryList();
                    setLoading(false);
                }
            }
            );

        } catch (error) {
            console.log('Failed to fetch event list:' + error);
        }
    }

    const handleEditOrder = (id) => {
        setOpenModalUpdate(true);
        (async () => {
            try {
                const response = await orderApi.getDetailOrder(id);
                console.log(response);
                form2.setFieldsValue({
                    status: response.status,
                    address: response.address,
                    description: response.description,
                    orderTotal: response.orderTotal,
                    products: response.products,
                    user: response.user,
                    billing: response.billing,
                });
                console.log(form2);
                setLoading(false);
            } catch (error) {
                throw error;
            }
        })();
    }

    const handleFilter = async (name) => {
        try {
            const res = await orderApi.searchOrder(name);
            setTotalList(res.totalDocs)
            setOrder(res.data.docs);
        } catch (error) {
            console.log('search to fetch category list:' + error);
        }
    }

    function NoData() {
        return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />;
    }

    const columns = [
        {
            title: 'ID',
            key: 'index',
            render: (text, record, index) => index + 1,
        },
        {
            title: 'Tên',
            dataIndex: 'user',
            key: 'user',
            render: (text, record) => <a>{text.username}</a>,
        },
        {
            title: 'Email',
            dataIndex: 'user',
            key: 'user',
            render: (text, record) => <a>{text.email}</a>,
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'orderTotal',
            key: 'orderTotal',
            render: (text) => <a>{text?.toLocaleString('vi', { style: 'currency', currency: 'VND' })}</a>,
        },
        {
            title: 'Hình thức thanh toán',
            dataIndex: 'billing',
            key: 'billing',
        },
        {
            title: 'Địa chỉ',
            dataIndex: 'address',
            key: 'address',
        },
        {
            title: 'Trạng thái',
            key: 'status',
            dataIndex: 'status',
            render: (slugs) => (
                <span >
                    {slugs === "rejected" ? <Tag style={{ width: 95, textAlign: "center" }} color="red">Đã hủy</Tag> : slugs === "approved" ? <Tag style={{ width: 95, textAlign: "center" }} color="geekblue" key={slugs}>
                        Vận chuyển
                    </Tag> : slugs === "final" ? <Tag color="green" style={{ width: 95, textAlign: "center" }}>Đã giao</Tag> : <Tag color="blue" style={{ width: 95, textAlign: "center" }}>Đợi xác nhận</Tag>}
                </span>
            ),
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: 'Action',
            key: 'action',
            render: (text, record) => (
                <div>
                    <Row>
                        <Button
                            size="small"
                            icon={<EditOutlined />}
                            style={{ width: 150, borderRadius: 15, height: 30 }}
                            onClick={() => handleEditOrder(record._id)}
                        >{"Chỉnh sửa"}
                        </Button>
                        <div
                            style={{ marginLeft: 10 }}>
                            <Popconfirm
                                title="Bạn có chắc chắn xóa đơn hàng này?"
                                onConfirm={() => handleDeleteCategory(record._id)}
                                okText="Yes"
                                cancelText="No"
                            >
                                <Button
                                    size="small"
                                    icon={<DeleteOutlined />}
                                    style={{ width: 150, borderRadius: 15, height: 30 }}
                                >{"Xóa"}
                                </Button>
                            </Popconfirm>
                        </div>
                    </Row>
                </div >
            ),
        },
    ];


    useEffect(() => {

        (async () => {
            try {
                await orderApi.getDetailOrder(id).then((res) => {
                    console.log(res);
                    setTotalList(res.totalDocs)
                    setOrder(res[0]);
                    setLoading(false);
                });
                ;
            } catch (error) {
                console.log('Failed to fetch event list:' + error);
            }
        })();
    }, [])
    return (
        <div>
            <Spin spinning={loading}>
                <div className='container'>
                    <div style={{ marginTop: 20 }}>
                        <Breadcrumb>
                            <Breadcrumb.Item href="">
                                <HomeOutlined />
                            </Breadcrumb.Item>
                            <Breadcrumb.Item href="">
                                <ShoppingCartOutlined />
                                <span>Chi tiết đơn hàng</span>
                            </Breadcrumb.Item>
                        </Breadcrumb>
                    </div>
                    <div className="order-details">
                        <h2>Chi tiết đơn hàng</h2>
                        <div className="order-info">
                            <p>
                                <strong>Mã Đơn Hàng:</strong> {order.id}
                            </p>
                            <p>
                                <strong>Người Dùng:</strong> {order.user_id}
                            </p>
                            <p>
                                <strong>Sản Phẩm:</strong>
                            </p>
                            <ul>
                                {order?.products?.map((product, index) => (
                                    <div key={index}>
                                        <li>Mã sản phẩm: {product?.product}</li>
                                        <li>Số Ngày Thuê: {product?.quantity}</li>
                                        <li>Tổng Tiền: {product?.rental_price}</li>
                                    </div>
                                ))}
                            </ul>
                            <p>
                                <strong>Tổng Giá Trị Đơn Hàng:</strong> {order.orderTotal}
                            </p>
                            <p>
                                <strong>Địa Chỉ:</strong> {order.address}
                            </p>
                            <p>
                                <strong>Thanh Toán:</strong> {order.billing}
                            </p>
                            <p>
                                <strong>Trạng Thái:</strong> {order.status}
                            </p>
                            <p>
                                <strong>Mô Tả:</strong> {order.description}
                            </p>

                        </div>
                    </div>
                </div>


                {/* <Pagination style={{ textAlign: "center", marginBottom: 20 }} current={currentPage} defaultCurrent={1} total={total} onChange={handlePage}></Pagination> */}
                <BackTop style={{ textAlign: 'right' }} />
            </Spin>
        </div >
    )
}

export default OrderDetail;