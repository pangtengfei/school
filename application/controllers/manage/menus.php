<?php
class menus extends CI_Controller {
	public function __construct() {
		parent::__construct ();
		$this->load->model ( 'manage/Menus_model' );
		$this->load->library ( 'Layout_manage' );
		$this->load->helper ( 'url' );
	}
	public function index() {
		$this->layout_manage->view ( "manage/menus/index" );
	}
	public function initData() {
		echo $this->Menus_model->queryData ();
	}
	public function addOrEdit() {
		$id = $this->input->post ( 'id' );
		$name = $this->input->post ( 'name' );
		$type = $this->input->post ( 'type' );
		$isAdd = $this->input->post ( 'isAdd' );
        $url = $this->input->post ( 'url' );
		if($isAdd=="1"){
			$this->Menus_model->add($id,$name,$type,$url);
		}
		else
		{
			$this->Menus_model->edit ($id,$name,$type,$url);
		}
	}
	public function del(){
		$id = $this->input->post ( 'id' );
		echo $this->Menus_model->deleteMenu ($id);
	}
}