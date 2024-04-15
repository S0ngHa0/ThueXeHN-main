import {
  Breadcrumb,
  Button,
  Card, Form,
  Input,
  Row,
  Select, Spin, Table, Tag, Typography, notification
} from "antd";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import axiosClient from "../../../apis/axiosClient";
import eventApi from "../../../apis/eventApi";
import productApi from "../../../apis/productApi";
import {
  EditOutlined,
  EyeOutlined,
} from '@ant-design/icons';

const { Meta } = Card;
const { Option } = Select;

const { Title } = Typography;
const DATE_TIME_FORMAT = "DD/MM/YYYY HH:mm";
const { TextArea } = Input;

const CartHistory = () => {
  const [orderList, setOrderList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [suggest, setSuggest] = useState([]);
  const [visible, setVisible] = useState(false);
  const [dataForm, setDataForm] = useState([]);
  const [lengthForm, setLengthForm] = useState();
  const [form] = Form.useForm();
  const [template_feedback, setTemplateFeedback] = useState();
  let { id } = useParams();
  const history = useHistory();

  const hideModal = () => {
    setVisible(false);
  };

  const handleJointEvent = async (id) => {
    try {
      await eventApi.joinEvent(id).then((response) => {
        if (response === undefined) {
          notification["error"]({
            message: `Notification`,
            description: "Joint Event Failed",
          });
        } else {
          notification["success"]({
            message: `Thông báo`,
            description: "Successfully Joint Event",
          });
          listEvent();
        }
      });
    } catch (error) {
      console.log("Failed to fetch event list:" + error);
    }
  };

  const handleCancelJointEvent = async (id) => {
    try {
      await eventApi.cancelJoinEvent(id).then((response) => {
        if (response === undefined) {
          notification["error"]({
            message: `Notification`,
            description: "Cancel Join Event Failed",
          });
        } else {
          notification["success"]({
            message: `Thông báo`,
            description: "Successfully Cancel Joint Event",
          });
          listEvent();
        }
      });
    } catch (error) {
      console.log("Failed to fetch event list:" + error);
    }
  };

  const listEvent = () => {
    setLoading(true);
    (async () => {
      try {
        const response = await eventApi.getDetailEvent(id);
        console.log(response);
        setOrderList(response);
        setLoading(false);
      } catch (error) {
        console.log("Failed to fetch event detail:" + error);
      }
    })();
    window.scrollTo(0, 0);
  };

  const handleDetailEvent = (id) => {
    history.replace("/event-detail/" + id);
    window.location.reload();
    window.scrollTo(0, 0);
  };

  const getDataForm = async (uid) => {
    try {
      await axiosClient
        .get("/event/" + id + "/template_feedback/" + uid + "/question")
        .then((response) => {
          console.log(response);
          setDataForm(response);
          let tabs = [];
          for (let i = 0; i < response.length; i++) {
            tabs.push({
              content: response[i]?.content,
              uid: response[i]?.uid,
              is_rating: response[i]?.is_rating,
            });
          }
          form.setFieldsValue({
            users: tabs,
          });
          setLengthForm(tabs.length);
        });
    } catch (error) {
      throw error;
    }
  };

  const handleDirector = () => {
    history.push("/evaluation/" + id);
  };

  const onFinish = async (values) => {
    console.log(values.users);
    let tabs = [];
    for (let i = 0; i < values.users.length; i++) {
      tabs.push({
        scope:
          values.users[i]?.scope == undefined ? null : values.users[i]?.scope,
        comment:
          values.users[i]?.comment == undefined
            ? null
            : values.users[i]?.comment,
        question_uid: values.users[i]?.uid,
      });
    }
    console.log(tabs);
    setLoading(true);
    try {
      const dataForm = {
        answers: tabs,
      };
      await axiosClient
        .post("/event/" + id + "/answer", dataForm)
        .then((response) => {
          if (response === undefined) {
            notification["error"]({
              message: `Notification`,
              description: "Answer event question failed",
            });
            setLoading(false);
          } else {
            notification["success"]({
              message: `Notification`,
              description: "Successfully answer event question",
            });
            setLoading(false);
            form.resetFields();
          }
        });
    } catch (error) {
      throw error;
    }
  };

  const columns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: "Giá",
      dataIndex: "products",
      key: "products",
      render: (products) => (
        <div>
          {products.map((item, index) => (
            <div key={index}>
              {item.rental_price.toLocaleString("vi", {
                style: "currency",
                currency: "VND",
              })}
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "Số lượng",
      dataIndex: "products",
      key: "products",
      render: (products) => (
        <div>
          {products.map((item, index) => (
            <div key={index}>{item.quantity}</div>
          ))}
        </div>
      ),
    },
    {
      title: "Tổng đơn hàng",
      dataIndex: "order_total",
      key: "order_total",
      render: (text) => (
        <div>
          {text?.toLocaleString("vi", {
            style: "currency",
            currency: "VND",
          })}
        </div>
      ),
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Hình thức thanh toán",
      dataIndex: "billing",
      key: "billing",
    },
    {
      title: 'Trạng thái',
      key: 'status',
      dataIndex: 'status',
      render: (slugs) => (
        <span >
          {slugs === "rejected" ? <Tag style={{ width: 95, textAlign: "center" }} color="red">Từ chối</Tag> : slugs === "approved" ? <Tag style={{ width: 95, textAlign: "center" }} color="geekblue" key={slugs}>
            Vận chuyển
          </Tag> : slugs === "final" ? <Tag color="green" style={{ width: 95, textAlign: "center" }}>Phê duyệt</Tag> : <Tag color="blue" style={{ width: 95, textAlign: "center" }}>Đợi xác nhận</Tag>}
        </span>
      ),
    },
    {
      title: "Ngày đặt",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (createdAt) => (
        <span>{moment(createdAt).format("DD/MM/YYYY HH:mm")}</span>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (text, record) => (
        <div>
          <Row>
            <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
              {record.status === 'pending' && (
                <Button
                  size="small"
                  icon={<EditOutlined />}
                  style={{ width: 150, borderRadius: 15, height: 30 }}
                  onClick={() => handleEditOrder(record.id)}
                >
                  Hủy xe
                </Button>
              )}
            </div>
          </Row>
        </div>
      ),
    },
  ];

  const handleEditOrder = async (id) => {
    console.log(id);
    setLoading(true);
    try {
      const categoryList = {
        "newDescription": "Đã hủy",
        "newStatus": "rejected"
      }
      await axiosClient.put("/order/update/" + id, categoryList).then(response => {
        if (response === undefined) {
          notification["error"]({
            message: `Thông báo`,
            description:
              'Cập nhật thất bại',
          });
        }
        else {
          notification["success"]({
            message: `Thông báo`,
            description:
              'Cập nhật thành công',
          });
          handleCategoryList();
        }
      })
      setLoading(false);

    } catch (error) {
      throw error;
    }
  }

  const handleCategoryList = () => {
    (async () => {
      try {
        const current = JSON.parse(localStorage.getItem("user"));
        await productApi.getOrderByUser(current.user.id).then((item) => {
          console.log(item[0]);
          setOrderList(item[0]);
        });
        setLoading(false);
      } catch (error) {
        console.log("Failed to fetch event detail:" + error);
      }
    })();
  }

  useEffect(() => {
    (async () => {
      try {
        const current = JSON.parse(localStorage.getItem("user"));
        await productApi.getOrderByUser(current.user.id).then((item) => {
          console.log(item[0]);
          setOrderList(item[0]);
        });
        setLoading(false);
      } catch (error) {
        console.log("Failed to fetch event detail:" + error);
      }
    })();
    window.scrollTo(0, 0);
  }, []);

  return (
    <div>
      <Spin spinning={false}>
        <Card className="container_details">
          <div className="product_detail">
            <div style={{ marginLeft: 5, marginBottom: 10, marginTop: 10 }}>
              <Breadcrumb>
                <Breadcrumb.Item href="http://localhost:3500/home">
                  <span>Trang chủ</span>
                </Breadcrumb.Item>
                <Breadcrumb.Item href="">
                  <span>Quản lý đơn hàng </span>
                </Breadcrumb.Item>
              </Breadcrumb>
            </div>
            <hr></hr>
            <div className="container" style={{ marginBottom: 30 }}>
              {/* <h1 style={{ fontSize: 30, marginTop: 25, paddingBottom: 10 }}>
            Quản lý đơn hàng
          </h1> */}
              <br></br>
              <Card>
                <Table
                  columns={columns}
                  dataSource={orderList}
                  rowKey="_id"
                  pagination={{ position: ["bottomCenter"] }}
                />
              </Card>
            </div>
          </div>
        </Card>
      </Spin>
    </div>
  );
};

export default CartHistory;
