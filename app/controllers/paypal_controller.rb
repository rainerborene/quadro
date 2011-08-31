class PaypalController < ApplicationController
  before_filter :authenticate_user!
  before_filter :get_subscription

  def checkout
    ppr = PayPal::Recurring.new({
      :return_url   => paypal_thank_you_path(:only_path => false),
      :cancel_url   => paypal_canceled_path(:only_path => false),
      :ipn_url      => paypal_ipn_path(:only_path => false),
      :description  => "Quadro - Monthly Subscription",
      :amount       => "5.00",
      :currency     => "USD"
    })

    response = ppr.checkout
    redirect_to response.valid?? response.checkout_url : paypal_canceled_path
  end

  def thank_you
    ppr = PayPal::Recurring.new({
      :token       => params[:token]
      :payer_id    => params[:PayerID]
      :amount      => "4.00",
      :description => "Quadro - Monthly Subscription"
    })

    response = ppr.request_payment
    response.approved? 
    response.completed?
  end

  def canceled
  end

  def ipn
  end

  private

  def get_subscription
    # should create one subscription for the logged user
    #
  end
end
