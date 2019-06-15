class Diary
{
	constructor(diaryElem)
	{
		this.MONTH=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
		
		this.elem=diaryElem
		const navElem=this.elem.querySelector('#navigator')
		this.nav=new Navigator(navElem)
		
		this.textfield=this.elem.querySelector('#textfield')
		this.dateText=this.elem.querySelector('#date')
		this.promptText=this.elem.querySelector('#prompt')
		this.date=new Date()
		this.dateText.innerText=this.MONTH[this.date.getMonth()]+' '+this.date.getDate()
		this.textfield.addEventListener('click',e=>{e.stopPropagation();this.nav.edit()})
		document.body.addEventListener('click',()=>{
			if(!this.nav.chk.classList.contains('inactive'))
				{
					this.nav.view()
					this.updateEntry()
				}
			})
		this.elem.addEventListener('back',()=>this.backward())
		this.elem.addEventListener('fwd',()=>this.forward())
		this.PROMPTS=[]
		const PROMPTS_URL='https://fullstackccu.github.io/final-project/diary-assets/prompts.txt'
		fetch(PROMPTS_URL).then(response=>response.text()).then(txt=>{
			txt=txt.split(',')
			txt.forEach(item=>{
				item=item.replace(/'/g,"").replace("\n","")
				this.PROMPTS.push(item)
			})
			this.promptText.innerText=this.PROMPTS[parseInt(this.date.getTime()/86400000)%this.PROMPTS.length]
		})
	}
	

	updateEntry()
	{
		const diaryContent=escape(this.textfield.value)
		const d=this.toDBDateString(this.date)
		const row=['"'+d+'"',diaryContent]
		let tIdx=this.entry.diary.findIndex(item=>{return item[0].replace(/"/g,'')===d})
		if(tIdx===-1)//append &sort
		{
			this.entry.diary.push(row)
			const opt={'method':'PATCH','body':'{\"date\":\"'+d+'\",\"content\":\"'+diaryContent+'\"}','headers':{'Accept':'application/json','Content-Type':'application/json'}}
			fetch('/'+this.id+'/'+this.entry.diary.length,opt).then(response=>{return response.json()}).then(json=>{
				if(json.error!=undefined)
					console.error(json.error)
				const getOpt={'method':'GET'}
				fetch('/'+this.id+'/sort/'+this.sheetId,getOpt).then(response=>{return response.json()}).then(json=>{
					if(json.error!==undefined)
						console.error(json.error)
				})
			})
			this.entry.diary.sort()
		}
		else//update if found
		{
			this.entry.diary[tIdx][1]=diaryContent
			const opt={'method':'PATCH','body':'{\"date\":\"'+d+'\",\"content\":\"'+diaryContent+'\"}','headers':{'Accept':'application/json','Content-Type':'application/json'}}
			fetch('/'+this.id+'/'+(tIdx+1),opt).then(response=>{return response.json}).then(json=>{
				if(json.error!==undefined)
					console.error(json.error)
			})
		}
	}
	setId(id,sheetid)
	{
		this.textfield.value=''
		this.id=id
		this.sheetId=sheetid
		const getOpt={'method':'GET'}
		fetch('/'+this.id+'/getdiary/0',getOpt).then(response=>{return response.json()}).then(json=>{
				this.entry=json
				
				let di=this.entry.diary.findIndex(item=>{return item[0].replace(/"/g,'')===this.toDBDateString(this.date)})
				if(di===-1)
					this.textfield.value=''
				else
					this.textfield.value=unescape(this.entry.diary[di][1])
			})
	}
	toDBDateString(date)
	{
		let d=date.getDate()
		if(d<10) d='0'+d
		let m=date.getMonth()+1
		if(m<10) m='0'+m
		let y=date.getFullYear()
		return y+'/'+m+'/'+d
	}
	backward()
	{
		this.date.setTime(this.date.getTime()-86400000)
		this.dateText.innerText=this.MONTH[this.date.getMonth()]+' '+this.date.getDate()
		this.promptText.innerText=this.PROMPTS[parseInt(this.date.getTime()/86400000)%this.PROMPTS.length]
		const dateString=this.toDBDateString(this.date)
		let di=this.entry.diary.findIndex(item=>{return item[0].replace(/"/g,'')===this.toDBDateString(this.date)})
		if(di===-1)
			this.textfield.value=''
		else
			this.textfield.value=unescape(this.entry.diary[di][1])
	}
	forward()
	{
		this.date.setTime(this.date.getTime()+86400000)
		this.dateText.innerText=this.MONTH[this.date.getMonth()]+' '+this.date.getDate()
		this.promptText.innerText=this.PROMPTS[parseInt(this.date.getTime()/86400000)%this.PROMPTS.length]
		const dateString=this.toDBDateString(this.date)
		let di=this.entry.diary.findIndex(item=>{return item[0].replace(/"/g,'')===this.toDBDateString(this.date)})
		if(di===-1)
			this.textfield.value=''
		else
			this.textfield.value=unescape(this.entry.diary[di][1])

	}
	
	show=()=>this.elem.classList.remove('inactive')
	hide=()=>this.elem.classList.add('inactive')
}