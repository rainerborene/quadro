require 'spec_helper'

describe HomeController do
  render_views

  describe "A visitor" do
    subject { create :board, share_public: true }

    describe "GET /share/:id" do
      it "should be able to access a public board" do
        get :share, id: subject.secret_token
        expect(assigns(:board).secret_token).to eql subject.secret_token
        expect(assigns(:board).share_public).to be_truthy
        expect(assigns(:readonly)).to be_truthy
        expect(response.status).to be(200)
        expect(response).to render_template("index")
        expect(response.body).to include("#{assigns(:board).title} • Quadro")
      end
    end
  end
end
