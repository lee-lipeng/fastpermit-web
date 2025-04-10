export interface City {
  name: string;
  code: string;
  province?: string;
}

export const cities: City[] = [
  // 直辖市
  { name: "北京", code: "beijing", province: "北京" },
  { name: "上海", code: "shanghai", province: "上海" },
  { name: "天津", code: "tianjin", province: "天津" },
  { name: "重庆", code: "chongqing", province: "重庆" },

  // 河北省
  { name: "石家庄", code: "shijiazhuang", province: "河北" },
  { name: "唐山", code: "tangshan", province: "河北" },
  { name: "秦皇岛", code: "qinhuangdao", province: "河北" },
  { name: "邯郸", code: "handan", province: "河北" },
  { name: "邢台", code: "xingtai", province: "河北" },
  { name: "保定", code: "baoding", province: "河北" },
  { name: "张家口", code: "zhangjiakou", province: "河北" },
  { name: "承德", code: "chengde", province: "河北" },
  { name: "沧州", code: "cangzhou", province: "河北" },
  { name: "廊坊", code: "langfang", province: "河北" },
  { name: "衡水", code: "hengshui", province: "河北" },

  // 山西省
  { name: "太原", code: "taiyuan", province: "山西" },
  { name: "大同", code: "datong", province: "山西" },
  { name: "阳泉", code: "yangquan", province: "山西" },
  { name: "长治", code: "changzhi", province: "山西" },
  { name: "晋城", code: "jincheng", province: "山西" },
  { name: "朔州", code: "shuozhou", province: "山西" },
  { name: "晋中", code: "jinzhong", province: "山西" },
  { name: "运城", code: "yuncheng", province: "山西" },
  { name: "忻州", code: "xinzhou", province: "山西" },
  { name: "临汾", code: "linfen", province: "山西" },
  { name: "吕梁", code: "lvliang", province: "山西" },

  // 辽宁省
  { name: "沈阳", code: "shenyang", province: "辽宁" },
  { name: "大连", code: "dalian", province: "辽宁" },
  { name: "鞍山", code: "anshan", province: "辽宁" },
  { name: "抚顺", code: "fushun", province: "辽宁" },
  { name: "本溪", code: "benxi", province: "辽宁" },
  { name: "丹东", code: "dandong", province: "辽宁" },
  { name: "锦州", code: "jinzhou", province: "辽宁" },
  { name: "营口", code: "yingkou", province: "辽宁" },
  { name: "阜新", code: "fuxin", province: "辽宁" },
  { name: "辽阳", code: "liaoyang", province: "辽宁" },
  { name: "盘锦", code: "panjin", province: "辽宁" },
  { name: "铁岭", code: "tieling", province: "辽宁" },
  { name: "朝阳", code: "chaoyang", province: "辽宁" },
  { name: "葫芦岛", code: "huludao", province: "辽宁" },

  // 吉林省
  { name: "长春", code: "changchun", province: "吉林" },
  { name: "吉林", code: "jilin", province: "吉林" },
  { name: "四平", code: "siping", province: "吉林" },
  { name: "辽源", code: "liaoyuan", province: "吉林" },
  { name: "通化", code: "tonghua", province: "吉林" },
  { name: "白山", code: "baishan", province: "吉林" },
  { name: "松原", code: "songyuan", province: "吉林" },
  { name: "白城", code: "baicheng", province: "吉林" },

  // 黑龙江省
  { name: "哈尔滨", code: "haerbin", province: "黑龙江" },
  { name: "齐齐哈尔", code: "qiqihaer", province: "黑龙江" },
  { name: "鸡西", code: "jixi", province: "黑龙江" },
  { name: "鹤岗", code: "hegang", province: "黑龙江" },
  { name: "双鸭山", code: "shuangyashan", province: "黑龙江" },
  { name: "大庆", code: "daqing", province: "黑龙江" },
  { name: "伊春", code: "yichun", province: "黑龙江" },
  { name: "佳木斯", code: "jiamusi", province: "黑龙江" },
  { name: "七台河", code: "qitaihe", province: "黑龙江" },
  { name: "牡丹江", code: "mudanjiang", province: "黑龙江" },
  { name: "黑河", code: "heihe", province: "黑龙江" },
  { name: "绥化", code: "suihua", province: "黑龙江" },

  // 江苏省
  { name: "南京", code: "nanjing", province: "江苏" },
  { name: "无锡", code: "wuxi", province: "江苏" },
  { name: "徐州", code: "xuzhou", province: "江苏" },
  { name: "常州", code: "changzhou", province: "江苏" },
  { name: "苏州", code: "suzhou", province: "江苏" },
  { name: "南通", code: "nantong", province: "江苏" },
  { name: "连云港", code: "lianyungang", province: "江苏" },
  { name: "淮安", code: "huaian", province: "江苏" },
  { name: "盐城", code: "yancheng", province: "江苏" },
  { name: "扬州", code: "yangzhou", province: "江苏" },
  { name: "镇江", code: "zhenjiang", province: "江苏" },
  { name: "泰州", code: "taizhou", province: "江苏" },
  { name: "宿迁", code: "suqian", province: "江苏" },

  // 浙江省
  { name: "杭州", code: "hangzhou", province: "浙江" },
  { name: "宁波", code: "ningbo", province: "浙江" },
  { name: "温州", code: "wenzhou", province: "浙江" },
  { name: "嘉兴", code: "jiaxing", province: "浙江" },
  { name: "湖州", code: "huzhou", province: "浙江" },
  { name: "绍兴", code: "shaoxing", province: "浙江" },
  { name: "金华", code: "jinhua", province: "浙江" },
  { name: "衢州", code: "quzhou", province: "浙江" },
  { name: "舟山", code: "zhoushan", province: "浙江" },
  { name: "台州", code: "taizhou", province: "浙江" },
  { name: "丽水", code: "lishui", province: "浙江" },

  // 安徽省
  { name: "合肥", code: "hefei", province: "安徽" },
  { name: "芜湖", code: "wuhu", province: "安徽" },
  { name: "蚌埠", code: "bengbu", province: "安徽" },
  { name: "淮南", code: "huainan", province: "安徽" },
  { name: "马鞍山", code: "maanshan", province: "安徽" },
  { name: "淮北", code: "huaibei", province: "安徽" },
  { name: "铜陵", code: "tongling", province: "安徽" },
  { name: "安庆", code: "anqing", province: "安徽" },
  { name: "黄山", code: "huangshan", province: "安徽" },
  { name: "滁州", code: "chuzhou", province: "安徽" },
  { name: "阜阳", code: "fuyang", province: "安徽" },
  { name: "宿州", code: "suzhou", province: "安徽" },
  { name: "六安", code: "liuan", province: "安徽" },
  { name: "亳州", code: "bozhou", province: "安徽" },
  { name: "池州", code: "chizhou", province: "安徽" },
  { name: "宣城", code: "xuancheng", province: "安徽" },

  // 福建省
  { name: "福州", code: "fuzhou", province: "福建" },
  { name: "厦门", code: "xiamen", province: "福建" },
  { name: "莆田", code: "putian", province: "福建" },
  { name: "三明", code: "sanming", province: "福建" },
  { name: "泉州", code: "quanzhou", province: "福建" },
  { name: "漳州", code: "zhangzhou", province: "福建" },
  { name: "南平", code: "nanping", province: "福建" },
  { name: "龙岩", code: "longyan", province: "福建" },
  { name: "宁德", code: "ningde", province: "福建" },

  // 江西省
  { name: "南昌", code: "nanchang", province: "江西" },
  { name: "景德镇", code: "jingdezhen", province: "江西" },
  { name: "萍乡", code: "pingxiang", province: "江西" },
  { name: "九江", code: "jiujiang", province: "江西" },
  { name: "新余", code: "xinyu", province: "江西" },
  { name: "鹰潭", code: "yingtan", province: "江西" },
  { name: "赣州", code: "ganzhou", province: "江西" },
  { name: "吉安", code: "jian", province: "江西" },
  { name: "宜春", code: "yichun", province: "江西" },
  { name: "抚州", code: "fuzhou", province: "江西" },
  { name: "上饶", code: "shangrao", province: "江西" },

  // 山东省
  { name: "济南", code: "jinan", province: "山东" },
  { name: "青岛", code: "qingdao", province: "山东" },
  { name: "淄博", code: "zibo", province: "山东" },
  { name: "枣庄", code: "zaozhuang", province: "山东" },
  { name: "东营", code: "dongying", province: "山东" },
  { name: "烟台", code: "yantai", province: "山东" },
  { name: "潍坊", code: "weifang", province: "山东" },
  { name: "济宁", code: "jining", province: "山东" },
  { name: "泰安", code: "taian", province: "山东" },
  { name: "威海", code: "weihai", province: "山东" },
  { name: "日照", code: "rizhao", province: "山东" },
  { name: "临沂", code: "linyi", province: "山东" },
  { name: "德州", code: "dezhou", province: "山东" },
  { name: "聊城", code: "liaocheng", province: "山东" },
  { name: "滨州", code: "binzhou", province: "山东" },
  { name: "菏泽", code: "heze", province: "山东" },

  // 河南省
  { name: "郑州", code: "zhengzhou", province: "河南" },
  { name: "开封", code: "kaifeng", province: "河南" },
  { name: "洛阳", code: "luoyang", province: "河南" },
  { name: "平顶山", code: "pingdingshan", province: "河南" },
  { name: "安阳", code: "anyang", province: "河南" },
  { name: "鹤壁", code: "hebi", province: "河南" },
  { name: "新乡", code: "xinxiang", province: "河南" },
  { name: "焦作", code: "jiaozuo", province: "河南" },
  { name: "濮阳", code: "puyang", province: "河南" },
  { name: "许昌", code: "xuchang", province: "河南" },
  { name: "漯河", code: "luohe", province: "河南" },
  { name: "三门峡", code: "sanmenxia", province: "河南" },
  { name: "南阳", code: "nanyang", province: "河南" },
  { name: "商丘", code: "shangqiu", province: "河南" },
  { name: "信阳", code: "xinyang", province: "河南" },
  { name: "周口", code: "zhoukou", province: "河南" },
  { name: "驻马店", code: "zhumadian", province: "河南" },

  // 湖北省
  { name: "武汉", code: "wuhan", province: "湖北" },
  { name: "黄石", code: "huangshi", province: "湖北" },
  { name: "十堰", code: "shiyan", province: "湖北" },
  { name: "宜昌", code: "yichang", province: "湖北" },
  { name: "襄阳", code: "xiangyang", province: "湖北" },
  { name: "鄂州", code: "ezhou", province: "湖北" },
  { name: "荆门", code: "jingmen", province: "湖北" },
  { name: "孝感", code: "xiaogan", province: "湖北" },
  { name: "荆州", code: "jingzhou", province: "湖北" },
  { name: "黄冈", code: "huanggang", province: "湖北" },
  { name: "咸宁", code: "xianning", province: "湖北" },
  { name: "随州", code: "suizhou", province: "湖北" },

  // 湖南省
  { name: "长沙", code: "changsha", province: "湖南" },
  { name: "株洲", code: "zhuzhou", province: "湖南" },
  { name: "湘潭", code: "xiangtan", province: "湖南" },
  { name: "衡阳", code: "hengyang", province: "湖南" },
  { name: "邵阳", code: "shaoyang", province: "湖南" },
  { name: "岳阳", code: "yueyang", province: "湖南" },
  { name: "常德", code: "changde", province: "湖南" },
  { name: "张家界", code: "zhangjiajie", province: "湖南" },
  { name: "益阳", code: "yiyang", province: "湖南" },
  { name: "郴州", code: "chenzhou", province: "湖南" },
  { name: "永州", code: "yongzhou", province: "湖南" },
  { name: "怀化", code: "huaihua", province: "湖南" },
  { name: "娄底", code: "loudi", province: "湖南" },

  // 广东省
  { name: "广州", code: "guangzhou", province: "广东" },
  { name: "韶关", code: "shaoguan", province: "广东" },
  { name: "深圳", code: "shenzhen", province: "广东" },
  { name: "珠海", code: "zhuhai", province: "广东" },
  { name: "汕头", code: "shantou", province: "广东" },
  { name: "佛山", code: "foshan", province: "广东" },
  { name: "江门", code: "jiangmen", province: "广东" },
  { name: "湛江", code: "zhanjiang", province: "广东" },
  { name: "茂名", code: "maoming", province: "广东" },
  { name: "肇庆", code: "zhaoqing", province: "广东" },
  { name: "惠州", code: "huizhou", province: "广东" },
  { name: "梅州", code: "meizhou", province: "广东" },
  { name: "汕尾", code: "shanwei", province: "广东" },
  { name: "河源", code: "heyuan", province: "广东" },
  { name: "阳江", code: "yangjiang", province: "广东" },
  { name: "清远", code: "qingyuan", province: "广东" },
  { name: "东莞", code: "dongguan", province: "广东" },
  { name: "中山", code: "zhongshan", province: "广东" },
  { name: "潮州", code: "chaozhou", province: "广东" },
  { name: "揭阳", code: "jieyang", province: "广东" },
  { name: "云浮", code: "yunfu", province: "广东" },

  // 广西壮族自治区
  { name: "南宁", code: "nanning", province: "广西" },
  { name: "柳州", code: "liuzhou", province: "广西" },
  { name: "桂林", code: "guilin", province: "广西" },
  { name: "梧州", code: "wuzhou", province: "广西" },
  { name: "北海", code: "beihai", province: "广西" },
  { name: "防城港", code: "fangchenggang", province: "广西" },
  { name: "钦州", code: "qinzhou", province: "广西" },
  { name: "贵港", code: "guigang", province: "广西" },
  { name: "玉林", code: "yulin", province: "广西" },
  { name: "百色", code: "baise", province: "广西" },
  { name: "贺州", code: "hezhou", province: "广西" },
  { name: "河池", code: "hechi", province: "广西" },
  { name: "来宾", code: "laibin", province: "广西" },
  { name: "崇左", code: "chongzuo", province: "广西" },

  // 海南省
  { name: "海口", code: "haikou", province: "海南" },
  { name: "三亚", code: "sanya", province: "海南" },
  { name: "三沙", code: "sansha", province: "海南" },
  { name: "儋州", code: "danzhou", province: "海南" },

  // 四川省
  { name: "成都", code: "chengdu", province: "四川" },
  { name: "自贡", code: "zigong", province: "四川" },
  { name: "攀枝花", code: "panzhihua", province: "四川" },
  { name: "泸州", code: "luzhou", province: "四川" },
  { name: "德阳", code: "deyang", province: "四川" },
  { name: "绵阳", code: "mianyang", province: "四川" },
  { name: "广元", code: "guangyuan", province: "四川" },
  { name: "遂宁", code: "suining", province: "四川" },
  { name: "内江", code: "neijiang", province: "四川" },
  { name: "乐山", code: "leshan", province: "四川" },
  { name: "南充", code: "nanchong", province: "四川" },
  { name: "眉山", code: "meishan", province: "四川" },
  { name: "宜宾", code: "yibin", province: "四川" },
  { name: "广安", code: "guangan", province: "四川" },
  { name: "达州", code: "dazhou", province: "四川" },
  { name: "雅安", code: "yaan", province: "四川" },
  { name: "巴中", code: "bazhong", province: "四川" },
  { name: "资阳", code: "ziyang", province: "四川" },

  // 贵州省
  { name: "贵阳", code: "guiyang", province: "贵州" },
  { name: "六盘水", code: "liupanshui", province: "贵州" },
  { name: "遵义", code: "zunyi", province: "贵州" },
  { name: "安顺", code: "anshun", province: "贵州" },
  { name: "毕节", code: "bijie", province: "贵州" },
  { name: "铜仁", code: "tongren", province: "贵州" },

  // 云南省
  { name: "昆明", code: "kunming", province: "云南" },
  { name: "曲靖", code: "qujing", province: "云南" },
  { name: "玉溪", code: "yuxi", province: "云南" },
  { name: "保山", code: "baoshan", province: "云南" },
  { name: "昭通", code: "zhaotong", province: "云南" },
  { name: "丽江", code: "lijiang", province: "云南" },
  { name: "普洱", code: "puer", province: "云南" },
  { name: "临沧", code: "lincang", province: "云南" },

  // 西藏自治区
  { name: "拉萨", code: "lasa", province: "西藏" },
  { name: "日喀则", code: "rikaze", province: "西藏" },
  { name: "昌都", code: "changdu", province: "西藏" },
  { name: "林芝", code: "linzhi", province: "西藏" },
  { name: "山南", code: "shannan", province: "西藏" },
  { name: "那曲", code: "naqu", province: "西藏" },
  { name: "阿里", code: "ali", province: "西藏" },

  // 陕西省
  { name: "西安", code: "xian", province: "陕西" },
  { name: "铜川", code: "tongchuan", province: "陕西" },
  { name: "宝鸡", code: "baoji", province: "陕西" },
  { name: "咸阳", code: "xianyang", province: "陕西" },
  { name: "渭南", code: "weinan", province: "陕西" },
  { name: "延安", code: "yanan", province: "陕西" },
  { name: "汉中", code: "hanzhong", province: "陕西" },
  { name: "榆林", code: "yulin", province: "陕西" },
  { name: "安康", code: "ankang", province: "陕西" },
  { name: "商洛", code: "shangluo", province: "陕西" },

  // 甘肃省
  { name: "兰州", code: "lanzhou", province: "甘肃" },
  { name: "嘉峪关", code: "jiayuguan", province: "甘肃" },
  { name: "金昌", code: "jinchang", province: "甘肃" },
  { name: "白银", code: "baiyin", province: "甘肃" },
  { name: "天水", code: "tianshui", province: "甘肃" },
  { name: "武威", code: "wuwei", province: "甘肃" },
  { name: "张掖", code: "zhangye", province: "甘肃" },
  { name: "平凉", code: "pingliang", province: "甘肃" },
  { name: "酒泉", code: "jiuquan", province: "甘肃" },
  { name: "庆阳", code: "qingyang", province: "甘肃" },

  // 青海省
  { name: "西宁", code: "xining", province: "青海" },
  { name: "海东", code: "haidong", province: "青海" },

  // 宁夏回族自治区
  { name: "银川", code: "yinchuan", province: "宁夏" },
  { name: "石嘴山", code: "shizuishan", province: "宁夏" },
  { name: "吴忠", code: "wuzhong", province: "宁夏" },
  { name: "固原", code: "guyuan", province: "宁夏" },
  { name: "中卫", code: "zhongwei", province: "宁夏" },

  // 新疆维吾尔自治区
  { name: "乌鲁木齐", code: "wulumuqi", province: "新疆" },
  { name: "克拉玛依", code: "kelamayi", province: "新疆" },
  { name: "吐鲁番", code: "tulufan", province: "新疆" },
  { name: "哈密", code: "hami", province: "新疆" },
  { name: "昌吉", code: "changji", province: "新疆" },
  { name: "博尔塔拉", code: "boertala", province: "新疆" },
  { name: "巴音郭楞", code: "bayinguoleng", province: "新疆" },
  { name: "阿克苏", code: "akesu", province: "新疆" },
  { name: "克孜勒苏", code: "kezilesu", province: "新疆" },
  { name: "喀什", code: "kashi", province: "新疆" },
  { name: "和田", code: "hetian", province: "新疆" },
  { name: "伊犁", code: "yili", province: "新疆" },
  { name: "塔城", code: "tacheng", province: "新疆" },
  { name: "阿勒泰", code: "aletai", province: "新疆" },

  // 台湾省
  { name: "台北", code: "taipei", province: "台湾" },
  { name: "高雄", code: "gaoxiong", province: "台湾" },
  { name: "基隆", code: "jilong", province: "台湾" },
  { name: "台中", code: "taizhong", province: "台湾" },
  { name: "台南", code: "tainan", province: "台湾" },
  { name: "新竹", code: "xinzhu", province: "台湾" },
  { name: "嘉义", code: "jiayi", province: "台湾" },

  // 香港特别行政区
  { name: "香港", code: "xianggang", province: "香港" },

  // 澳门特别行政区
  { name: "澳门", code: "aomen", province: "澳门" },
];
