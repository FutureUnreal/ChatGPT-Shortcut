import React, { useContext, useState } from "react";
import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";
import Link from "@docusaurus/Link";
import { Form, Input, Button, message, Modal, Typography, Switch } from "antd";
import { UserOutlined, HeartOutlined, EditOutlined } from "@ant-design/icons";
import LoginComponent from "./login";
import Translate, { translate } from "@docusaurus/Translate";
import { submitPrompt } from "@site/src/api";
import { AuthContext } from "../AuthContext";

const UserStatus = ({ hideLinks = { userCenter: false, myFavorite: false } }) => {
  const { userAuth, setUserAuth, refreshUserAuth } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await submitPrompt(values);
      await refreshUserAuth();
      form.resetFields();
      message.success(<Translate id="message.success">词条提交成功！</Translate>);
      message.success(<Translate id="message.success1">点击标签「我的提示词」查看已添加的自定义提示词。</Translate>);
      setOpen(false);
    } catch (err) {
      console.error(err);
      message.error(<Translate id="message.error">词条提交失败，请稍后重试</Translate>);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (ExecutionEnvironment.canUseDOM) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("userAllInfo");
      localStorage.removeItem("userAllInfoCacheExpiration");
    }
    setUserAuth(null);
    window.location.reload();
  };

  const handleLogoutConfirm = () => {
    Modal.confirm({
      title: "Confirm Logout",
      content: "Click OK to log out.",
      onOk: handleLogout,
    });
  };

  if (userAuth === undefined) {
    return <div>Loading...</div>;
  } else if (userAuth) {
    return (
      <>
        {!hideLinks.userCenter && (
          <Link to="/user" className="button button--secondary" style={{ marginRight: "10px" }}>
            <UserOutlined />
            <Translate id="link.user">个人中心</Translate>
          </Link>
        )}
        {!hideLinks.myFavorite && (
          <Link to="/user/favorite" className="button button--secondary hide-on-small-screen-500" style={{ marginRight: "10px" }}>
            <HeartOutlined style={{ marginRight: "1px" }} />
            <Translate id="link.myfavorite">我的收藏</Translate>
          </Link>
        )}
        <Link className="button button--primary" onClick={() => setOpen(true)} style={{ marginRight: "10px" }}>
          <EditOutlined /> <Translate id="link.addprompt">添加提示词</Translate>
        </Link>
        <Button type="default" onClick={handleLogoutConfirm} style={{ color: "gray" }}>
          <Translate id="button.logout">退出登录</Translate>
        </Button>
        <Modal
          title={translate({
            id: "modal.addprompt.title",
            message: "添加 Prompt（本内容将出现在「我的提示词」标签中）",
          })}
          open={open}
          footer={null}
          onCancel={() => setOpen(false)}>
          <Form form={form} onFinish={onFinish}>
            <Form.Item
              name="title"
              rules={[
                {
                  required: true,
                  message: translate({
                    id: "message.addprompt.requiredTitle",
                    message: "请输入提示词标题！",
                  }),
                },
              ]}>
              <Input
                placeholder={translate({
                  id: "input.addprompt.title",
                  message: "提示词名称",
                })}
              />
            </Form.Item>
            <Form.Item
              name="description"
              rules={[
                {
                  required: true,
                  message: translate({
                    id: "message.addprompt.requiredDescription",
                    message: "请输入提示词内容！",
                  }),
                },
              ]}>
              <Input.TextArea
                placeholder={translate({
                  id: "input.addprompt.description",
                  message: "提示词内容",
                })}
                rows={4}
              />
            </Form.Item>
            <Form.Item name="remark">
              <Input
                placeholder={translate({
                  id: "input.addprompt.remark",
                  message: "提示词作用（非必填）",
                })}
              />
            </Form.Item>
            <Form.Item name="notes">
              <Input.TextArea
                placeholder={translate({
                  id: "input.addprompt.notes",
                  message: "备注（非必填）：您可以在此提供提示词的来源说明，以及该提示词的其他语言版本。此外，如果您有任何关于该提示词的拓展想法和需求，请在此进行说明。",
                })}
                rows={3}
              />
            </Form.Item>
            <Form.Item name="share" valuePropName="checked">
              <div style={{ display: "flex", alignItems: "center" }}>
                <Switch
                  defaultChecked
                  onChange={(checked) => {
                    form.setFieldsValue({ share: checked });
                  }}
                  checkedChildren={translate({
                    id: "input.addprompt.share.checked",
                    message: "是",
                  })}
                  unCheckedChildren={translate({
                    id: "input.addprompt.share.unchecked",
                    message: "否",
                  })}
                />
                <Typography.Text type="secondary" style={{ marginLeft: 8 }}>
                  <Translate id="message.addprompt.submission">您是否愿意将该提示词分享到公开页面？</Translate>
                </Typography.Text>
              </div>
            </Form.Item>
            <Button htmlType="submit" loading={loading}>
              <Translate id="button.addPrompt">添加 Prompt</Translate>
            </Button>
          </Form>
        </Modal>
      </>
    );
  } else {
    // 未登录状态下不显示任何按钮
    return null;
  }
};

export default UserStatus;
