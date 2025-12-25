using System;
using System.Drawing;
using System.Collections;
using System.ComponentModel;
using System.Windows.Forms;
using System.Data;
using System.Net;
using System.Text;

namespace WindowsApplication1
{
	/// <summary>
	/// Summary description for Form1.
	/// </summary>
	public class Form1 : System.Windows.Forms.Form
	{
		private System.Windows.Forms.TextBox textBox1;
		private System.Windows.Forms.Button button1;
		private System.Windows.Forms.Button button2;
		private System.Windows.Forms.Button button3;
        private System.Windows.Forms.Button button4;
        private TextBox textBox2;
        private TextBox textBox3;
        private TextBox textBox4;
        private Label label1;
        private Label label2;
        private Label label3;
        private Button button5;
		/// <summary>
		/// Required designer variable.
		/// </summary>
		private System.ComponentModel.Container components = null;

		public Form1()
		{
			//
			// Required for Windows Form Designer support
			//
			InitializeComponent();

			//
			// TODO: Add any constructor code after InitializeComponent call
			//
		}

		/// <summary>
		/// Clean up any resources being used.
		/// </summary>
		protected override void Dispose( bool disposing )
		{
			if( disposing )
			{
				if (components != null) 
				{
					components.Dispose();
				}
			}
			base.Dispose( disposing );
		}

		#region Windows Form Designer generated code
		/// <summary>
		/// Required method for Designer support - do not modify
		/// the contents of this method with the code editor.
		/// </summary>
		private void InitializeComponent()
		{
            this.textBox1 = new System.Windows.Forms.TextBox();
            this.button1 = new System.Windows.Forms.Button();
            this.button2 = new System.Windows.Forms.Button();
            this.button3 = new System.Windows.Forms.Button();
            this.button4 = new System.Windows.Forms.Button();
            this.textBox2 = new System.Windows.Forms.TextBox();
            this.textBox3 = new System.Windows.Forms.TextBox();
            this.textBox4 = new System.Windows.Forms.TextBox();
            this.label1 = new System.Windows.Forms.Label();
            this.label2 = new System.Windows.Forms.Label();
            this.label3 = new System.Windows.Forms.Label();
            this.button5 = new System.Windows.Forms.Button();
            this.SuspendLayout();
            // 
            // textBox1
            // 
            this.textBox1.Location = new System.Drawing.Point(24, 16);
            this.textBox1.Multiline = true;
            this.textBox1.Name = "textBox1";
            this.textBox1.ScrollBars = System.Windows.Forms.ScrollBars.Vertical;
            this.textBox1.Size = new System.Drawing.Size(392, 384);
            this.textBox1.TabIndex = 0;
            // 
            // button1
            // 
            this.button1.Location = new System.Drawing.Point(436, 142);
            this.button1.Name = "button1";
            this.button1.Size = new System.Drawing.Size(120, 56);
            this.button1.TabIndex = 1;
            this.button1.Text = "Kullanıcı bilgileri kontrolü";
            this.button1.Click += new System.EventHandler(this.button1_Click);
            // 
            // button2
            // 
            this.button2.Location = new System.Drawing.Point(436, 206);
            this.button2.Name = "button2";
            this.button2.Size = new System.Drawing.Size(120, 56);
            this.button2.TabIndex = 2;
            this.button2.Text = "Mesaj gönderimi (SMSToMany)";
            this.button2.Click += new System.EventHandler(this.button2_Click);
            // 
            // button3
            // 
            this.button3.Location = new System.Drawing.Point(436, 270);
            this.button3.Name = "button3";
            this.button3.Size = new System.Drawing.Size(120, 56);
            this.button3.TabIndex = 3;
            this.button3.Text = "Mesaj gönderimi (SMS MultiSenders)";
            this.button3.Click += new System.EventHandler(this.button3_Click);
            // 
            // button4
            // 
            this.button4.Location = new System.Drawing.Point(436, 334);
            this.button4.Name = "button4";
            this.button4.Size = new System.Drawing.Size(120, 56);
            this.button4.TabIndex = 4;
            this.button4.Text = "TimerID bazında raporlama";
            this.button4.Click += new System.EventHandler(this.button4_Click);
            // 
            // textBox2
            // 
            this.textBox2.Location = new System.Drawing.Point(510, 17);
            this.textBox2.Name = "textBox2";
            this.textBox2.Size = new System.Drawing.Size(100, 20);
            this.textBox2.TabIndex = 5;
            // 
            // textBox3
            // 
            this.textBox3.Location = new System.Drawing.Point(510, 43);
            this.textBox3.Name = "textBox3";
            this.textBox3.Size = new System.Drawing.Size(100, 20);
            this.textBox3.TabIndex = 5;
            // 
            // textBox4
            // 
            this.textBox4.Location = new System.Drawing.Point(510, 69);
            this.textBox4.Name = "textBox4";
            this.textBox4.Size = new System.Drawing.Size(100, 20);
            this.textBox4.TabIndex = 5;
            // 
            // label1
            // 
            this.label1.AutoSize = true;
            this.label1.Location = new System.Drawing.Point(426, 20);
            this.label1.Name = "label1";
            this.label1.Size = new System.Drawing.Size(64, 13);
            this.label1.TabIndex = 6;
            this.label1.Text = "Kullanıcı Adı";
            // 
            // label2
            // 
            this.label2.AutoSize = true;
            this.label2.Location = new System.Drawing.Point(426, 47);
            this.label2.Name = "label2";
            this.label2.Size = new System.Drawing.Size(28, 13);
            this.label2.TabIndex = 6;
            this.label2.Text = "Şifre";
            // 
            // label3
            // 
            this.label3.AutoSize = true;
            this.label3.Location = new System.Drawing.Point(426, 73);
            this.label3.Name = "label3";
            this.label3.Size = new System.Drawing.Size(55, 13);
            this.label3.TabIndex = 6;
            this.label3.Text = "Bayi Kodu";
            // 
            // button5
            // 
            this.button5.Location = new System.Drawing.Point(573, 206);
            this.button5.Name = "button5";
            this.button5.Size = new System.Drawing.Size(131, 58);
            this.button5.TabIndex = 7;
            this.button5.Text = "Türkçe";
            this.button5.UseVisualStyleBackColor = true;
            this.button5.Click += new System.EventHandler(this.button5_Click_1);
            // 
            // Form1
            // 
            this.AutoScaleBaseSize = new System.Drawing.Size(5, 13);
            this.ClientSize = new System.Drawing.Size(735, 421);
            this.Controls.Add(this.button5);
            this.Controls.Add(this.label3);
            this.Controls.Add(this.label2);
            this.Controls.Add(this.label1);
            this.Controls.Add(this.textBox4);
            this.Controls.Add(this.textBox3);
            this.Controls.Add(this.textBox2);
            this.Controls.Add(this.button4);
            this.Controls.Add(this.button3);
            this.Controls.Add(this.button2);
            this.Controls.Add(this.button1);
            this.Controls.Add(this.textBox1);
            this.Name = "Form1";
            this.Text = "XML API C# Örnek";
            this.ResumeLayout(false);
            this.PerformLayout();

		}
		#endregion

		/// <summary>
		/// The main entry point for the application.
		/// </summary>
		[STAThread]
		static void Main() 
		{
			Application.Run(new Form1());
		}

		private string HTTPPoster(string prmSendData)
		{
			try
			{
				WebClient wUpload = new WebClient();
                wUpload.Proxy = null;
				Byte[] bPostArray = Encoding.UTF8.GetBytes(prmSendData);
				Byte[] bResponse = wUpload.UploadData("http://g.iletimx.com","POST",bPostArray);
                Char[] sReturnChars = Encoding.UTF8.GetChars(bResponse);
				string sWebPage = new string(sReturnChars);
				return sWebPage;				
			}
			catch 
			{	
				return "-1";				
			}
		}

		private void button1_Click(object sender, System.EventArgs e)
		{
            textBox1.Text = HTTPPoster( "<MainReportRoot><UserName>"+textBox2.Text+"-"+textBox4.Text+"</UserName><PassWord>"+textBox3.Text+"</PassWord><Action>4</Action></MainReportRoot>");
		}

		private void button2_Click(object sender, System.EventArgs e)
		{
            textBox1.Text = HTTPPoster("<MainmsgBody><UserName>" + textBox2.Text + "-" + textBox4.Text + "</UserName><PassWord>" + textBox3.Text + "</PassWord><Action>0</Action><Mesgbody>deneme mesaji</Mesgbody><Numbers>05060662966</Numbers><Originator>OsmanTest</Originator><SDate></SDate></MainmsgBody>");
		}

		private void button3_Click(object sender, System.EventArgs e)
		{
            textBox1.Text = HTTPPoster( "<MainmsgBody><UserName>" + textBox2.Text + "-" + textBox4.Text + "</UserName><PassWord>" + textBox3.Text + "</PassWord><Action>1</Action><Messages><Message><Mesgbody>Deneme Mesaji 1</Mesgbody><Number>05321234567</Number></Message><Message><Mesgbody>Deneme Mesaji 2</Mesgbody><Number>05321234568</Number></Message></Messages><Originator>TEST</Originator><SDate></SDate></MainmsgBody>");
		//kişiye özel türkçe için action 13 kullanılacak
        }

		private void button4_Click(object sender, System.EventArgs e)
		{
            textBox1.Text = HTTPPoster("<MainReportRoot><UserName>" + textBox2.Text + "-" + textBox4.Text + "</UserName><PassWord>" + textBox3.Text + "</PassWord><Action>3</Action><MsgID>2898778</MsgID></MainReportRoot>");
		}

		private void button5_Click(object sender, System.EventArgs e)
		{
            
		}

        private void button5_Click_1(object sender, EventArgs e)
        {
            textBox1.Text = HTTPPoster("<MainmsgBody><UserName>" + textBox2.Text + "-" + textBox4.Text + "</UserName><PassWord>" + textBox3.Text + "</PassWord><Action>12</Action><Mesgbody><![CDATA[ışİŞöÖçÇüÜ123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890sonışık]]></Mesgbody><Numbers>05060662966</Numbers><Originator>Test</Originator><SDate></SDate></MainmsgBody>");
            
        }
	}
}
